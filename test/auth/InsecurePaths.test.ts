import '@relmify/jest-fp-ts';

describe('InsecurePaths', () => {
	beforeEach(() => {
		delete process.env.INSECURE_PATHS;
	});

	afterEach(() => {
		delete process.env.INSECURE_PATHS;
	});

	it('getInsecurePaths with only defaults', () => {
		throw new Error();
	});

	it('getInsecurePaths with env paths', () => {
		throw new Error();
	});
});
