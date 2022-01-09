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

	it('gets details for authenticated user', async () => {
		const token = createAccessToken(fullTestServer.keyPair.privateKey);
		const res = await request(fullTestServer.expressServer.server)
			.get('/user')
			.timeout(2000)
			.set('Authorization', `Bearer ${token}`)
			.expect(200);
		expect(res.body).toEqual({
			...accessToken
		});
	});

	it('fails when not authenticated', async () => {
		await request(fullTestServer.expressServer.server)
			.get('/user')
			.timeout(2000)
			.expect(401);
	});
});
