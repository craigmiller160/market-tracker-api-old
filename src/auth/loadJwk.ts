import axios from 'axios';
import * as E from 'fp-ts/Either';
import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';
import * as TEU from '../function/TaskEitherUtils';
import { pipe } from 'fp-ts/function';
import { JWK } from 'jwk-to-pem';

const JWK_URI = '/jwk';

export interface JwkSet {
	keys: JWK[];
}

const getAuthServerHost = (): E.Either<Error, string> =>
	pipe(
		O.fromNullable(process.env.AUTH_SERVER_HOST),
		E.fromOption(() => new Error('Auth Server Host is not available'))
	);

const getJwkSetFromAuthServer = (
	authServerHost: string
): TE.TaskEither<Error, JwkSet> =>
	pipe(
		TEU.tryCatch(() => axios.get<JwkSet>(`${authServerHost}${JWK_URI}`)),
		TE.map((_) => _.data)
	);

export const loadJwk = () => {
	pipe(getAuthServerHost(), TE.fromEither, TE.chain(getJwkSetFromAuthServer));
};
