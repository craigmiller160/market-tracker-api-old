import {
	accessToken,
	createAccessToken,
	createFullTestServer,
	FullTestServer,
	stopFullTestServer
} from '../../testutils/fullTestServer';
import request from 'supertest';

describe('user details route', () => {
	let fullTestServer: FullTestServer;
	beforeAll(async () => {
		fullTestServer = await createFullTestServer();
	});

	afterAll(async () => {
		await stopFullTestServer(fullTestServer);
	});

	describe('get user details', () => {
		it('gets details for authenticated user', async () => {
			const token = createAccessToken(fullTestServer.keyPair.privateKey);
			const res = await request(fullTestServer.expressServer.server)
				.get('/oauth/user')
				.timeout(2000)
				.set('Authorization', `Bearer ${token}`)
				.expect(200);
			expect(res.body).toEqual({
				...accessToken
			});
		});

		it('fails when not authenticated', async () => {
			await request(fullTestServer.expressServer.server)
				.get('/oauth/user')
				.timeout(2000)
				.expect(401);
		});
	});

	describe('get auth code login url', () => {
		it('successfully gets the url', async () => {
			throw new Error();
		});

		it('has an error while getting the url', async () => {
			throw new Error();
		});
	});
});
