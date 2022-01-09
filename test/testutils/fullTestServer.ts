import { ExpressServer, startExpressServer } from '../../src/express';
import { ec } from 'elliptic';
import {
	createMongoTestServer,
	MongoTestServer,
	stopMongoTestServer
} from './mongoServer';
import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import * as TEU from '../../src/function/TaskEitherUtils';
import { stopExpressServer } from './expressServer';
import { createKeyPair } from './keyPair';
import { TokenKey } from '../../src/auth/TokenKey';

export interface FullTestServer {
	readonly keyPair: ec.KeyPair;
	readonly expressServer: ExpressServer;
	readonly mongoServer: MongoTestServer;
}

const createExpressServerWithKey = (
	keyPair: ec.KeyPair
): TE.TaskEither<Error, ExpressServer> => {
	const tokenKey: TokenKey = {
		key: keyPair.getPublic('hex')
	};
	return startExpressServer(tokenKey);
};

export const createFullTestServer = (): Promise<FullTestServer> =>
	pipe(
		createKeyPair(),
		TE.fromEither,
		TE.bindTo('keyPair'),
		TE.bind('mongoServer', createMongoTestServer),
		TE.bind('expressServer', ({ keyPair }) =>
			createExpressServerWithKey(keyPair)
		),
		TEU.throwIfLeft
	)();

export const stopFullTestServer = (
	fullTestServer: FullTestServer
): Promise<unknown> =>
	pipe(
		stopMongoTestServer(fullTestServer.mongoServer),
		TE.chain(() => stopExpressServer(fullTestServer.expressServer.server)),
		TEU.throwIfLeft
	)();
