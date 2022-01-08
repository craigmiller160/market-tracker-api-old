export {};

describe('loadJwk', () => {
	beforeEach(() => {
		process.env.AUTH_SERVER_HOST = 'https://authServerHost';
	});

	afterEach(() => {
		process.env.AUTH_SERVER_HOST = undefined;
	});

	it('loads the JWK as a PEM', () => {
		throw new Error();
	});
});
