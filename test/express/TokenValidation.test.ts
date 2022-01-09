import {
	createFullTestServer,
	FullTestServer,
	stopFullTestServer
} from '../testutils/fullTestServer';

describe('TokenValidation', () => {
	let fullTestServer: FullTestServer;
	beforeAll(async () => {
		fullTestServer = await createFullTestServer();
	});

	afterAll(async () => {
		await stopFullTestServer(fullTestServer);
	});

	it('has valid access token', async () => {
		throw new Error();
	});

	it('access token is expired', async () => {
		throw new Error();
	});

	it('access token has invalid signature', async () => {
		throw new Error();
	});

	it('has no access token', async () => {
		throw new Error();
	});
});
