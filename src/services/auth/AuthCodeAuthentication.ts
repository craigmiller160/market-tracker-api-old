import { Request } from 'express';
import { getMarketTrackerSession } from '../../function/HttpRequest';
import * as O from 'fp-ts/Option';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import { compareAsc } from 'date-fns';
import * as IO from 'fp-ts/IO';
import * as IOE from 'fp-ts/IOEither';
import * as TEU from '../../function/TaskEitherUtils';
import * as TE from 'fp-ts/TaskEither';
import { restClient } from '../RestClient';
import { TokenResponse } from '../../types/TokenResponse';
import * as A from 'fp-ts/Array';
import { encodeForUri } from '../../function/UriEncoding';
import * as EU from '../../function/EitherUtils';
import { AppRefreshToken } from '../../mongo/models/AppRefreshTokenModel';
import { saveRefreshToken } from '../mongo/RefreshTokenService';
import {createTokenCookie} from './Cookie';

// TODO need special exception type to return 401s

// TODO need test for successful login
// TODO need test for login rejected
// TODO need test for invalid state
// TODO need test for expired state

export interface AuthCodeSuccess {
	readonly cookie: string;
	readonly postAuthRedirect: string;
}

interface AuthenticateBody {
	grant_type: string;
	client_id: string;
	code: string;
	redirect_uri: string;
}

const validateState = (
	req: Request,
	providedState: number
): E.Either<Error, number> => {
	const { state } = getMarketTrackerSession(req);
	return pipe(
		O.fromNullable(state),
		E.fromOption(() => new Error('Cannot find auth code state in session')),
		E.filterOrElse(
			(_) => _ === providedState,
			() => new Error('Invalid auth code state')
		)
	);
};

const validateStateExpiration = (req: Request): E.Either<Error, Date> => {
	const { stateExpiration } = getMarketTrackerSession(req);
	return pipe(
		O.fromNullable(stateExpiration),
		E.fromOption(
			() => new Error('Cannot find auth code state expiration in session')
		),
		E.filterOrElse(
			(_) => compareAsc(new Date(), _) <= 0,
			() => new Error('Auth code state has expired')
		)
	);
};

const validateOrigin = (req: Request): E.Either<Error, string> => {
	const { origin } = getMarketTrackerSession(req);
	return pipe(
		O.fromNullable(origin),
		E.fromOption(() => new Error('Cannot find origin in session'))
	);
};

const removeAuthCodeSessionAttributes = (req: Request): IO.IO<void> => {
	const session = getMarketTrackerSession(req);
	delete session.stateExpiration;
	delete session.state;
	delete session.origin;
	return IO.of(null);
};

const createAuthenticateBody = (
	origin: string,
	code: string,
	envVariables: string[]
): E.Either<Error, AuthenticateBody> => {
	const [clientKey, , authCodeRedirectUri] = envVariables;

	return pipe(
		E.sequenceArray([
			encodeForUri(code),
			encodeForUri(clientKey),
			encodeForUri(authCodeRedirectUri)
		]),
		E.map(
			([
				encodedCode,
				encodedClientKey,
				encodedAuthCodeRedirectUri
			]): AuthenticateBody => ({
				grant_type: 'authorization_code',
				client_id: encodedClientKey,
				code: encodedCode,
				redirect_uri: encodedAuthCodeRedirectUri
			})
		)
	);
};

const authenticateCode = (
	origin: string,
	code: string
): TE.TaskEither<Error, TokenResponse> => {
	const nullableEnvArray: Array<string | undefined> = [
		process.env.CLIENT_KEY,
		process.env.CLIENT_SECRET,
		process.env.AUTH_CODE_REDIRECT_URI
	];

	return pipe(
		nullableEnvArray,
		A.map(O.fromNullable),
		O.sequenceArray,
		O.map((_) => _ as string[]),
		E.fromOption(
			() =>
				new Error(
					`Missing environment variables to authenticate auth code: ${nullableEnvArray}`
				)
		),
		E.bindTo('envVariables'),
		E.bind('requestBody', ({ envVariables }) =>
			createAuthenticateBody(origin, code, envVariables)
		),
		E.bind('basicAuth', ({ envVariables }) => {
			const [clientKey, clientSecret] = envVariables;
			return EU.tryCatch(() =>
				Buffer.from(`${clientKey}:${clientSecret}`).toString('base64')
			);
		}),
		TE.fromEither,
		TE.chain(({ requestBody, basicAuth }) =>
			TEU.tryCatch(() =>
				restClient.post<TokenResponse>('', requestBody, {
					headers: {
						'content-type': 'application/x-www-form-urlencoded',
						authorization: `Basic ${basicAuth}`
					}
				})
			)
		),
		TE.map((_) => _.data)
	);
};

const handleRefreshToken = (
	tokenResponse: TokenResponse
): TE.TaskEither<Error, unknown> => {
	const refreshToken: AppRefreshToken = {
		tokenId: tokenResponse.tokenId,
		refreshToken: tokenResponse.refreshToken
	};
	return saveRefreshToken(refreshToken);
};

export const authenticateWithAuthCode = (
	req: Request,
	code: string,
	state: number
) => {
	pipe(
		validateState(req, state),
		E.chain(() => validateStateExpiration(req)),
		E.chain(() => validateOrigin(req)),
		E.chainFirst(IOE.fromIO(removeAuthCodeSessionAttributes(req))),
		TE.fromEither,
		TE.chain((_) => authenticateCode(_, code)),
		TE.chainFirst(handleRefreshToken),
		TE.chain((_) => TE.fromEither(createTokenCookie(_.accessToken)))
	);
	// TODO set access token as cookie
};
