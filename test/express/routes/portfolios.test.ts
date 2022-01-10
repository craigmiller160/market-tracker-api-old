import request from 'supertest';
import {
	Portfolio,
	PortfolioItem,
	PortfolioModel,
	portfolioToModel
} from '../../../src/mongo/models/PortfolioModel';
import {
	createAccessToken,
	createFullTestServer,
	FullTestServer,
	stopFullTestServer
} from '../../testutils/fullTestServer';
import * as A from 'fp-ts/Array';

type PortfolioItemWithId = PortfolioItem & {
	_id?: string;
};

type PortfolioWithId = Portfolio & {
	__v?: number;
	_id?: string;
	stocks: PortfolioItemWithId[];
	cryptos: PortfolioItemWithId[];
};

type RemoveIdsFromItems = (items: PortfolioItemWithId[]) => PortfolioItem[];
const removeIdsFromItems: RemoveIdsFromItems = A.map(
	(item: PortfolioItemWithId) => {
		delete item._id;
		return item;
	}
);

type RemoveIdsFromOutput = (output: PortfolioWithId[]) => Portfolio[];
const removeIdsFromOutput: RemoveIdsFromOutput = A.map(
	(portfolio: PortfolioWithId): Portfolio => {
		delete portfolio.__v;
		delete portfolio._id;
		const stocks = removeIdsFromItems(portfolio.stocks);
		const cryptos = removeIdsFromItems(portfolio.cryptos);
		return {
			...portfolio,
			stocks,
			cryptos
		};
	}
);

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
				stocks: [
					{
						symbol: 'ABC2',
						shares: 1
					},
					{
						symbol: 'DEF2',
						shares: 2
					}
				],
				cryptos: [
					{
						symbol: 'GHI2',
						shares: 3
					}
				]
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
			expect(removeIdsFromOutput(res.body)).toEqual(user1InitPortfolios);
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
				stocks: [
					{
						symbol: 'atv',
						shares: 1
					}
				],
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
			expect(removeIdsFromOutput(res.body)).toEqual([
				{
					...newPortfolios[0],
					userId: 1
				}
			]);
			const results = await PortfolioModel.find({ userId: 1 }).exec();
			expect(results).toHaveLength(1);
			const resultsWithoutIds = removeIdsFromOutput(results);
			expect(resultsWithoutIds[0]).toEqual(
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
