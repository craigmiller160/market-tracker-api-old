import {
	createMongoTestServer,
	MongoTestServer,
	stopMongoTestServer
} from '../../testutils/mongoServer';
import { pipe } from 'fp-ts/function';
import * as TEU from '../../../src/function/TaskEitherUtils';
import * as T from 'fp-ts/Task';
import { ExpressServer, startExpressServer } from '../../../src/express';
import request from 'supertest';
import {
	Portfolio,
	PortfolioModel
} from '../../../src/mongo/models/PortfolioModel';
import {
	createFullTestServer,
	FullTestServer,
	stopFullTestServer
} from '../../testutils/fullTestServer';

// TODO simplify re-use of test setup/cleanup logic

describe('portfolios', () => {
	let fullTestServer: FullTestServer;
	let user1InitPortfolios: Portfolio[];
	beforeAll(async () => {
		await createFullTestServer();
	});

	afterAll(async () => {
		await stopFullTestServer(fullTestServer);
	});

	beforeEach(async () => {
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
		const user1Models = user1InitPortfolios.map(
			(_) => new PortfolioModel(_)
		);
		await PortfolioModel.insertMany(user1Models);

		const user2Portfolios = [
			{
				userId: 2,
				portfolioName: 'Three',
				stocks: ['ABC2', 'DEF2'],
				cryptos: ['GHI2']
			}
		];
		const user2Models = user2Portfolios.map((_) => new PortfolioModel(_));
		await PortfolioModel.insertMany(user2Models);
	});

	afterEach(async () => {
		await PortfolioModel.deleteMany().exec();
	});

	it('getPortfolios', async () => {
		const res = await request(expressServer.server)
			.get('/portfolios')
			.timeout(2000)
			.expect(200);
		expect(res.body).toEqual([
			expect.objectContaining(user1InitPortfolios[0]),
			expect.objectContaining(user1InitPortfolios[1])
		]);
	});

	it('savePortfolios', async () => {
		const newPortfolios: Portfolio[] = [
			{
				userId: 10,
				portfolioName: 'Ten',
				stocks: ['atv'],
				cryptos: []
			}
		];
		const res = await request(expressServer.server)
			.post('/portfolios')
			.timeout(2000)
			.set('Content-Type', 'application/json')
			.send(newPortfolios)
			.expect(200);
		expect(res.body).toEqual([
			expect.objectContaining({
				...newPortfolios[0],
				userId: 1
			})
		]);
	});
});
