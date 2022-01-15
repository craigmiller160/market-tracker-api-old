import {
	accessToken,
	createAccessToken,
	createFullTestServer,
	FullTestServer,
	stopFullTestServer
} from '../../testutils/fullTestServer';
import request from 'supertest';

const clearEnv = () => {
	delete process.env.CLIENT_KEY;
	delete process.env.CLIENT_SECRET;
	delete process.env.AUTH_CODE_REDIRECT_URI;
	delete process.env.AUTH_LOGIN_BASE_URI;
};

const setEnv = () => {
	process.env.CLIENT_KEY = 'clientKey';
	process.env.CLIENT_SECRET = 'clientSecret';
	process.env.AUTH_CODE_REDIRECT_URI = '/authCodeRedirectUri';
	process.env.AUTH_LOGIN_BASE_URI = '/authLoginBaseUri';
};

describe('oauth routes', () => {
	let fullTestServer: FullTestServer;
	beforeAll(async () => {
		fullTestServer = await createFullTestServer();
	});

	afterAll(async () => {
		await stopFullTestServer(fullTestServer);
	});

	beforeEach(() => {
		clearEnv();
	});

	afterEach(() => {
		clearEnv();
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
		beforeEach(() => {
			setEnv();
		});

		it('successfully gets the url', async () => {
			const urlRegex =
				/^origin\/authLoginBaseUri\/ui\/login\?response_type=code&client_id=clientKey&redirect_uri=origin%2FauthCodeRedirectUri&state=.+$/;
			const res = await request(fullTestServer.expressServer.server)
				.post('/oauth/authcode/login')
				.set('Origin', 'origin')
				.timeout(2000)
				.expect(200);
			expect(res.body).toEqual({
				url: expect.stringMatching(urlRegex)
			});
		});

		it('has an error while getting the url', async () => {
			delete process.env.CLIENT_KEY;
			const res = await request(fullTestServer.expressServer.server)
				.post('/oauth/authcode/login')
				.set('Origin', 'origin')
				.timeout(2000)
				.expect(500);
			expect(res.body).toEqual({
				timestamp: expect.any(String),
				status: 500,
				message:
					'Missing environment variables for auth code login URL: ,/authCodeRedirectUri,/authLoginBaseUri',
				request: 'POST /oauth/authcode/login'
			});
		});
	});
});
