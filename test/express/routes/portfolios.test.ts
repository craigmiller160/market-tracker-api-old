import request from 'supertest';
import {
	Portfolio,
	PortfolioModel,
	portfolioToModel
} from '../../../src/mongo/models/PortfolioModel';
import {
	createAccessToken,
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
				stocks: [
					{
						symbol: 'ABC',
						shares: 1
					},
					{ symbol: 'DEF', shares: 2 }
				],
				cryptos: [{ symbol: 'GHI', shares: 3 }]
			},
			{
				userId: 1,
				portfolioName: 'Two',
				stocks: [
					{
						symbol: 'QRS',
						shares: 1
					},
					{
						symbol: 'QRS',
						shares: 2
					}
				],
				cryptos: [
					{
						symbol: 'QRS',
						shares: 3
					}
				]
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
			const token = createAccessToken(fullTestServer.keyPair.privateKey);
			const res = await request(fullTestServer.expressServer.server)
				.get('/portfolios')
				.set('Authorization', `Bearer ${token}`)
				.timeout(2000)
				.expect(200);
			expect(res.body).toEqual([
				expect.objectContaining(user1InitPortfolios[0]),
				expect.objectContaining(user1InitPortfolios[1])
			]);
		});

		it('failed auth', async () => {
			await request(fullTestServer.expressServer.server)
				.get('/portfolios')
				.timeout(2000)
				.expect(401);
		});
	});

	describe('savePortfolios', () => {
		const newPortfolios: Portfolio[] = [
			{
				userId: 10,
				portfolioName: 'Ten',
				stocks: ['atv'],
				cryptos: []
			}
		];

		it('successful auth', async () => {
			const token = createAccessToken(fullTestServer.keyPair.privateKey);
			const res = await request(fullTestServer.expressServer.server)
				.post('/portfolios')
				.timeout(2000)
				.set('Content-Type', 'application/json')
				.set('Authorization', `Bearer ${token}`)
				.send(newPortfolios)
				.expect(200);
			expect(res.body).toEqual([
				expect.objectContaining({
					...newPortfolios[0],
					userId: 1
				})
			]);
			const results = await PortfolioModel.find({ userId: 1 }).exec();
			expect(results).toHaveLength(1);
			expect(results[0]).toEqual(
				expect.objectContaining({
					...newPortfolios[0],
					userId: 1
				})
			);
		});

		it('failed auth', async () => {
			await request(fullTestServer.expressServer.server)
				.post('/portfolios')
				.timeout(2000)
				.set('Content-Type', 'application/json')
				.send(newPortfolios)
				.expect(401);
		});
	});
});
