import {
	createFullTestServer,
	FullTestServer,
	stopFullTestServer
} from '../../testutils/fullTestServer';
import {
	Watchlist,
	WatchlistModel
} from '../../../src/mongo/models/WatchlistModel';
import request from 'supertest';

describe('watchlists route', () => {
	let fullTestServer: FullTestServer;
	let user1InitWatchlists: Watchlist[];
	beforeAll(async () => {
		fullTestServer = await createFullTestServer();
	});

	afterAll(async () => {
		await stopFullTestServer(fullTestServer);
	});

	beforeEach(async () => {
		user1InitWatchlists = [
			{
				userId: 1,
				watchlistName: 'One',
				stocks: ['ABC', 'DEF'],
				cryptos: ['GHI']
			},
			{
				userId: 1,
				watchlistName: 'Two',
				stocks: ['QRS', 'TUV'],
				cryptos: ['WXYZ']
			}
		];
		const user1Watchlists = user1InitWatchlists.map(
			(_) => new WatchlistModel(_)
		);
		await WatchlistModel.insertMany(user1Watchlists);

		const user2Watchlists: Watchlist[] = [
			{
				userId: 2,
				watchlistName: 'Three',
				stocks: ['ABC2', 'DEF2'],
				cryptos: ['GHI2']
			}
		];
		const user2Models = user2Watchlists.map((_) => new WatchlistModel(_));
		await WatchlistModel.insertMany(user2Models);
	});

	afterEach(async () => {
		await WatchlistModel.deleteMany().exec();
	});

	it('getWatchlists', async () => {
		const res = await request(fullTestServer.expressServer.server)
			.get('/watchlists')
			.timeout(2000)
			.expect(200);
		expect(res.body).toEqual([
			expect.objectContaining(user1InitWatchlists[0]),
			expect.objectContaining(user1InitWatchlists[1])
		]);
	});

	it('saveWatchlists', async () => {
		const newWatchlists: Watchlist[] = [
			{
				userId: 10,
				watchlistName: 'Ten',
				stocks: ['atv'],
				cryptos: []
			}
		];

		const res = await request(fullTestServer.expressServer.server)
			.post('/watchlists')
			.timeout(2000)
			.set('Content-Type', 'application/json')
			.send(newWatchlists)
			.expect(200);
		expect(res.body).toEqual([
			expect.objectContaining({
				...newWatchlists[0],
				userId: 1
			})
		]);
	});
});
