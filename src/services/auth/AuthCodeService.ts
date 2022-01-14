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

const buildAuthCodeLoginUrl = (origin: string, state: number): string => {
	const nullableEnvArray: Array<string | undefined> = [
		process.env.CLIENT_KEY,
		process.env.AUTH_CODE_REDIRECT_URI,
		process.env.AUTH_LOGIN_BASE_URI
	];

	const result = pipe(
		nullableEnvArray,
		A.map(O.fromNullable),
		O.sequenceArray,
		O.map((_) => _ as string[]),
		O.map((envArray) =>
			A.map<string, string>((_) => encodeURIComponent(_))(envArray)
		)
	);

	const loginBaseUri = encodeURIComponent(''); // TODO get this from env
	const clientKey = encodeURIComponent(''); // TODO get this from env
	const redirectUri = encodeURIComponent(''); // TODO get this from env
	const encodedState = encodeURIComponent(state);
};

export const prepareAuthCodeLogin = (req: Request): E.Either<Error, string> => {
	const state = randomInt(1_000_000_000);
	return pipe(
		getOrigin(req),
		E.map((origin) => {
			storeAuthCodeLoginSessionValues(req, state, origin);
			return origin;
		}),
		E.map((origin) => buildAuthCodeLoginUrl(origin, state))
	);
};
