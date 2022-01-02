import {
	createMongoTestServer,
	MongoTestServer,
	stopMongoTestServer
} from '../../testutils/mongoServer';
import { pipe } from 'fp-ts/function';
import * as TEU from '../../../src/function/TaskEitherUtils';
import * as T from 'fp-ts/Task';
import * as EU from '../../../src/function/EitherUtils';
import { ExpressServer, startExpressServer } from '../../../src/express';
import request from 'supertest';

describe('portfolios', () => {
	let mongoTestServer: MongoTestServer;
	let expressServer: ExpressServer;
	beforeAll(async () => {
		await pipe(
			createMongoTestServer(),
			TEU.throwIfLeft,
			T.map((_) => {
				mongoTestServer = _;
			})
		)();

		expressServer = pipe(startExpressServer(), EU.throwIfLeft);
	});

	afterAll(async () => {
		await stopMongoTestServer(mongoTestServer)();
		expressServer[0].close();
	});

	it('getPortfolios', async () => {
		await request(expressServer[0]).get('/portfolios').expect(200);
	});

	it('savePortfolios', () => {
		throw new Error();
	});
});
