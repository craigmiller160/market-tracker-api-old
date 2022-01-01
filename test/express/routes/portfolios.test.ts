import {
	createMongoTestServer,
	MongoTestServer,
	stopMongoTestServer
} from '../../testutils/mongoServer';
import { pipe } from 'fp-ts/function';
import * as TEU from '../../../src/function/TaskEitherUtils';
import { Server } from 'http';
import * as T from 'fp-ts/Task';
import * as EU from '../../../src/function/EitherUtils'
import { startExpressServer } from '../../../src/express';

describe('portfolios', () => {
	let mongoTestServer: MongoTestServer;
	let expressServer: Server
	beforeAll(async () => {
		await pipe(
			createMongoTestServer(),
			TEU.throwIfLeft,
			T.map((_) => {
				mongoTestServer = _;
			})
		)();

		expressServer = pipe(
			startExpressServer(),
			EU.throwIfLeft
		);
	});

	afterAll(async () => {
		await stopMongoTestServer(mongoTestServer)();
		expressServer.close();
	});

	it('getPortfolios', () => {
		throw new Error();
	});

	it('savePortfolios', () => {
		throw new Error();
	});
});
