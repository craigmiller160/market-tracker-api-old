import * as E from 'fp-ts/Either';
import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';
import * as TEU from '../function/TaskEitherUtils';
import * as EU from '../function/EitherUtils';
import { pipe } from 'fp-ts/function';
import jwkToPem, { JWK } from 'jwk-to-pem';
import { TokenKey } from './TokenKey';
import { logDebug, logInfo } from '../logger';
import { restClient } from '../services/RestClient';

const JWK_URI = '/jwk';

export interface JwkSet {
	readonly keys: JWK[];
}

const getAuthServerHost = (): E.Either<Error, string> =>
	pipe(
		O.fromNullable(process.env.AUTH_SERVER_HOST),
		E.fromOption(
			() => new Error('Auth Server Host variable is not available')
		)
	);

const getJwkSetFromAuthServer = (
	authServerHost: string
): TE.TaskEither<Error, JwkSet> =>
	pipe(
		TEU.tryCatch(() =>
			restClient.get<JwkSet>(`${authServerHost}${JWK_URI}`)
		),
		TE.map((_) => _.data)
	);

const convertJwkToPem = (jwkSet: JwkSet): TE.TaskEither<Error, TokenKey> =>
	pipe(
		EU.tryCatch(() => jwkToPem(jwkSet.keys[0])),
		E.map(
			(_): TokenKey => ({
				key: _
			})
		),
		TE.fromEither
	);

export const loadJwk = (): TE.TaskEither<Error, TokenKey> =>
	pipe(
		getAuthServerHost(),
		TE.fromEither,
		TE.chainFirst(() => TE.fromIO(logDebug('Loading JWK'))),
		TE.chain(getJwkSetFromAuthServer),
		TE.chain(convertJwkToPem),
		TE.chainFirst(() => TE.fromIO(logInfo('JWK loaded')))
	);
