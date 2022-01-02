import { ExpressServer, startExpressServer } from '../../src/express';
import {
	createMongoTestServer,
	MongoTestServer,
	stopMongoTestServer
} from './mongoServer';
import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import * as TEU from '../../src/function/TaskEitherUtils';
import { stopExpressServer } from './expressServer';

export interface FullTestServer {
	readonly expressServer: ExpressServer;
	readonly mongoServer: MongoTestServer;
}

export const createFullTestServer = (): Promise<FullTestServer> =>
	pipe(
		createMongoTestServer(),
		TE.bindTo('mongoServer'),
		TE.bind('expressServer', startExpressServer),
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
