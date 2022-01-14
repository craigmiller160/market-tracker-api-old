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
import { AxiosResponse } from 'axios';

// TODO need special exception type to return 401s

// TODO need test for successful login
// TODO need test for login rejected
// TODO need test for invalid state
// TODO need test for expired state

export interface AuthCodeSuccess {
	readonly cookie: string;
	readonly postAuthRedirect: string;
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

const authenticateCode = (
	origin: string,
	code: string
): TE.TaskEither<Error, TokenResponse> => {
	// TODO urlEncode all values
	const body = {
		grant_type: 'authorization_code',
		client_id: '', // TODO get client key
		code,
		redirect_uri: '' // TODO get redirect uri
	};

	// TODO need basic auth for clientKey/clientSecret
	const basicAuth = '';

	return pipe(
		TEU.tryCatch(() =>
			restClient.post<TokenResponse>('', body, {
				headers: {
					'content-type': 'application/x-www-form-urlencoded',
					authorization: `Basic ${basicAuth}`
				}
			})
		),
		TE.map((_) => _.data)
	);
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
		E.chainFirst(IOE.fromIO(removeAuthCodeSessionAttributes(req)))
	);
	// TODO authenticate with Auth Server
	// TODO store refresh token in DB
	// TODO set access token as cookie
};
