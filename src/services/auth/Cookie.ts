import { pipe } from 'fp-ts/function';
import * as E from 'fp-ts/Either';
import * as O from 'fp-ts/Option';
import * as A from 'fp-ts/Array';

// TODO 401 exception

export const getEmptyCookie = (): E.Either<Error, string> =>
	pipe(
		O.fromNullable(process.env.COOKIE_NAME),
		E.fromOption(() => new Error('No cookie name environment variable')),
		E.map((_) => `${_}=; Max-Age=0`)
	);

const getCookieEnv = (): E.Either<Error, readonly string[]> => {
	const nullableEnvArray: Array<string | undefined> = [
		process.env.COOKIE_NAME,
		process.env.COOKIE_MAX_AGE_SECS,
		process.env.COOKIE_PATH
	];

	return pipe(
		nullableEnvArray,
		A.map(O.fromNullable),
		O.sequenceArray,
		E.fromOption(
			() =>
				new Error(
					`Missing environment variables for setting cookie: ${nullableEnvArray}`
				)
		)
	);
};

export const createTokenCookie = (
	accessToken: string
): E.Either<Error, string> =>
	pipe(
		getCookieEnv(),
		E.map(
			([cookieName, cookieMaxAgeSecs, cookiePath]) =>
				`${cookieName}=${accessToken}; Max-Age=${cookieMaxAgeSecs}; Secure; HttpOnly; SameSite=strict; Path=${cookiePath}`
		)
	);
