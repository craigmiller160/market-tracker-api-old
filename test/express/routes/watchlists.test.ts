import {createFullTestServer, FullTestServer, stopFullTestServer} from '../../testutils/fullTestServer';
import {Watchlist, WatchlistModel} from '../../../src/mongo/models/WatchlistModel';

export {};

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
		const user1Watchlists = user1InitWatchlists.map((_) => new WatchlistModel(_));
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
		throw new Error();
	});

	it('saveWatchlists', async () => {
		throw new Error();
	});
});
