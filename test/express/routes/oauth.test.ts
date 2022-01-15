/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
	accessToken,
	createAccessToken,
	createFullTestServer,
	FullTestServer,
	stopFullTestServer
} from '../../testutils/fullTestServer';
import request from 'supertest';
import { restClient } from '../../../src/services/RestClient';
import MockAdapter from 'axios-mock-adapter';

// TODO validate session for all tests

const clearEnv = () => {
	delete process.env.CLIENT_KEY;
	delete process.env.CLIENT_SECRET;
	delete process.env.AUTH_CODE_REDIRECT_URI;
	delete process.env.AUTH_LOGIN_BASE_URI;
	delete process.env.COOKIE_NAME;
	delete process.env.COOKIE_MAX_AGE_SECS;
	delete process.env.COOKIE_PATH;
};

const setEnv = () => {
	process.env.CLIENT_KEY = 'clientKey';
	process.env.CLIENT_SECRET = 'clientSecret';
	process.env.AUTH_CODE_REDIRECT_URI = '/authCodeRedirectUri';
	process.env.AUTH_LOGIN_BASE_URI = '/authLoginBaseUri';
	process.env.COOKIE_NAME = 'my-cookie';
	process.env.COOKIE_MAX_AGE_SECS = '8600';
	process.env.COOKIE_PATH = '/the-path';
};

const mockApi = new MockAdapter(restClient);
const EXPIRATION_REGEX = /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}/;

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
		mockApi.reset();
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
				/^origin\/authLoginBaseUri\/ui\/login\?response_type=code&client_id=clientKey&redirect_uri=origin%2FauthCodeRedirectUri&state=(?<state>\d+)$/;
			const loginRes = await request(fullTestServer.expressServer.server)
				.post('/oauth/authcode/login')
				.set('Origin', 'origin')
				.timeout(2000)
				.expect(200);
			expect(loginRes.body).toEqual({
				url: expect.stringMatching(urlRegex)
			});

			const state = urlRegex.exec(loginRes.body.url)?.groups?.state;
			expect(state).not.toBeUndefined();

			const cookieHeaders: string[] =
				loginRes.headers['set-cookie'] ?? [];
			expect(cookieHeaders).toHaveLength(1);

			const sessionRes = await request(
				fullTestServer.expressServer.server
			)
				.get('/session')
				.set('Cookie', cookieHeaders[0])
				.timeout(2000)
				.expect(200);
			expect(sessionRes.body).toEqual({
				state: parseInt(state!),
				origin: 'origin',
				stateExpiration: expect.stringMatching(EXPIRATION_REGEX)
			});
		});

		it('missing environment variables for login', async () => {
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

	describe('authenticate the auth code', () => {
		it('successfully authenticates the auth code', async () => {
			throw new Error();
		});

		it('missing environment variables for authentication', async () => {
			throw new Error();
		});

		it('missing environment variables for cookie creation', async () => {
			throw new Error();
		});

		it('invalid state for authentication', async () => {
			throw new Error();
		});

		it('expired state for authentication', async () => {
			throw new Error();
		});

		it('authentication rejected by auth server', async () => {
			throw new Error();
		});
	});
});
