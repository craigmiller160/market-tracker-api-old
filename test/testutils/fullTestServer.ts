import { ExpressServer, startExpressServer } from '../../src/express';
import { createMongoTestServer, MongoTestServer } from './mongoServer';
import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import * as TEU from '../../src/function/TaskEitherUtils';

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
	)()
