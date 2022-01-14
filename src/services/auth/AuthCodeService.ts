import { Request } from 'express';
import * as E from 'fp-ts/Either';
import * as O from 'fp-ts/Option';
import { pipe } from 'fp-ts/function';
import { randomInt } from 'crypto';
import * as A from 'fp-ts/Array';

const AUTH_CODE_LOGIN_PATH = '/ui/login';

const getOrigin = (req: Request): E.Either<Error, string> =>
	pipe(
		O.fromNullable(req.header('Origin')),
		E.fromOption(() => new Error('Missing origin header on request'))
	);

const storeAuthCodeLoginSessionValues = (
	req: Request,
	state: number,
	origin: string
): void => {
	req.session.state = state;
	req.session.origin = origin;
	// TODO set expiration
};

const createUrl = (
	envVariables: string[],
	origin: string,
	state: string
): string => {
	const [clientKey, authCodeRedirectUri, authLoginBaseUri] = envVariables;
	const baseUrl = `${origin}${authLoginBaseUri}${AUTH_CODE_LOGIN_PATH}`;
	const queryString = `response_type=code&client_id=${clientKey}&redirect_uri=${authCodeRedirectUri}&state=${state}`;
	return `${baseUrl}?${queryString}`;
};

const buildAuthCodeLoginUrl = (
	origin: string,
	state: number
): E.Either<Error, string> => {
	const encodedState = encodeURIComponent(state);
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
		O.map(A.map<string, string>(encodeURIComponent)),
		O.map((_) => createUrl(_, origin, encodedState)),
		E.fromOption(
			() =>
				new Error(
					`Missing environment variables for auth code login URL: ${nullableEnvArray}`
				)
		)
	);
};

export const prepareAuthCodeLogin = (req: Request): E.Either<Error, string> => {
	const state = randomInt(1_000_000_000);
	return pipe(
		getOrigin(req),
		E.map((origin) => {
			storeAuthCodeLoginSessionValues(req, state, origin);
			return origin;
		}),
		E.chain((origin) => buildAuthCodeLoginUrl(origin, state))
	);
};
