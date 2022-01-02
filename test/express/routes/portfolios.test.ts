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
import { Portfolio, PortfolioModel } from '../../../src/mongo/models/PortfolioModel';

describe('portfolios', () => {
	let mongoTestServer: MongoTestServer;
	let expressServer: ExpressServer;
	let user1InitPortfolios: Portfolio[];
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

	beforeEach(() => {
		user1InitPortfolios = [
			{
				userId: 1,
				portfolioName: 'One',
				stocks: ['ABC', 'DEF'],
				cryptos: ['GHI']
			},
			{
				userId: 1,
				portfolioName: 'Two',
				stocks: ['QRS', 'TUV'],
				cryptos: ['WXYZ']
			}
		];
		const user1Models = user1InitPortfolios.map((_) => new PortfolioModel(_));
		PortfolioModel.insertMany(user1Models);
	});

	afterEach(() => {
		PortfolioModel.deleteMany().exec();
	})

	it('getPortfolios', async () => {
		const res = await request(expressServer[0])
			.get('/portfolios')
			.expect(200);
		expect(res.body).toEqual([
			expect.objectContaining(user1InitPortfolios[0]),
			expect.objectContaining(user1InitPortfolios[1])
		]);
	});

	it('savePortfolios', () => {
		throw new Error();
	});
});
