import request from 'supertest';
import {
	Portfolio,
	PortfolioModel,
	portfolioToModel
} from '../../../src/mongo/models/PortfolioModel';
import {
	createFullTestServer,
	FullTestServer,
	stopFullTestServer
} from '../../testutils/fullTestServer';

describe('portfolios', () => {
	let user1InitPortfolios: Portfolio[];
	let fullTestServer: FullTestServer;
	beforeAll(async () => {
		fullTestServer = await createFullTestServer();
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
		const user1Models = user1InitPortfolios.map(portfolioToModel);
		await PortfolioModel.insertMany(user1Models);

		const user2Portfolios: Portfolio[] = [
			{
				userId: 2,
				portfolioName: 'Three',
				stocks: ['ABC2', 'DEF2'],
				cryptos: ['GHI2']
			}
		];
		const user2Models = user2Portfolios.map(portfolioToModel);
		await PortfolioModel.insertMany(user2Models);
	});

	afterEach(async () => {
		await PortfolioModel.deleteMany().exec();
	});

	describe('getPortfolios', () => {
		it('successful auth', async () => {
			const res = await request(fullTestServer.expressServer.server)
				.get('/portfolios')
				.timeout(2000)
				.expect(200);
			expect(res.body).toEqual([
				expect.objectContaining(user1InitPortfolios[0]),
				expect.objectContaining(user1InitPortfolios[1])
			]);
		});

		it('failed auth', async () => {
			throw new Error();
		});
	});

	describe('savePortfolios', async () => {
		it('successful auth', async () => {
			const newPortfolios: Portfolio[] = [
				{
					userId: 10,
					portfolioName: 'Ten',
					stocks: ['atv'],
					cryptos: []
				}
			];
			const res = await request(fullTestServer.expressServer.server)
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

		it('failed auth', async () => {
			throw new Error();
		});
	});
});
