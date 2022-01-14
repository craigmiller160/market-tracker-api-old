import { Request } from 'express';
import * as E from 'fp-ts/Either';
import * as O from 'fp-ts/Option';
import { pipe } from 'fp-ts/function';
import { randomInt } from 'crypto';
import * as A from 'fp-ts/Array';
import * as IO from 'fp-ts/IO';
import * as IOE from 'fp-ts/IOEither';
import { encodeForUri } from '../../function/UriEncoding';
import {getHeader} from '../../function/HttpRequest';

const AUTH_CODE_LOGIN_PATH = '/ui/login';

const getOrigin = (req: Request): E.Either<Error, string> =>
	pipe(
		getHeader(req, 'Origin'),
		E.fromOption(() => new Error('Missing origin header on request'))
	);

const storeAuthCodeLoginSessionValues = (
	req: Request,
	state: number,
	origin: string
): IO.IO<void> => {
	req.session.state = state;
	req.session.origin = origin;
	// TODO set expiration
	return IO.of(null);
};

const createUrl = (
	envVariables: string[],
	origin: string,
	state: number
): E.Either<Error, string> => {
	const [clientKey, authCodeRedirectUri, authLoginBaseUri] = envVariables;
	const baseUrl = `${origin}${authLoginBaseUri}${AUTH_CODE_LOGIN_PATH}`;

	return pipe(
		E.sequenceArray([
			encodeForUri(clientKey),
			encodeForUri(authCodeRedirectUri),
			encodeForUri(state)
		]),
		E.map(
			([encodedClientKey, encodedRedirectUri, encodedState]) =>
				`response_type=code&client_id=${encodedClientKey}&redirect_uri=${encodedRedirectUri}&state=${encodedState}`
		),
		E.map((queryString) => `${baseUrl}?${queryString}`)
	);
};

const buildAuthCodeLoginUrl = (
	origin: string,
	state: number
): E.Either<Error, string> => {
	const nullableEnvArray: Array<string | undefined> = [
		process.env.CLIENT_KEY,
		process.env.AUTH_CODE_REDIRECT_URI,
		process.env.AUTH_LOGIN_BASE_URI
	];

	return pipe(
		nullableEnvArray,
		A.map(O.fromNullable),
		O.sequenceArray,
		O.map((_) => _ as string[]),
		E.fromOption(
			() =>
				new Error(
					`Missing environment variables for auth code login URL: ${nullableEnvArray}`
				)
		),
		E.chain((_) => createUrl(_, origin, state))
	);
};

export const prepareAuthCodeLogin = (req: Request): E.Either<Error, string> => {
	const state = randomInt(1_000_000_000);
	return pipe(
		getOrigin(req),
		E.chainFirst((_) =>
			IOE.fromIO<void, Error>(
				storeAuthCodeLoginSessionValues(req, state, _)
			)()
		),
		E.chain((origin) => buildAuthCodeLoginUrl(origin, state))
	);
};
