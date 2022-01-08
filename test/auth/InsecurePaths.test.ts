import {
	DEFAULT_INSECURE_PATHS,
	getInsecurePaths
} from '../../src/auth/InsecurePaths';

describe('InsecurePaths', () => {
	beforeEach(() => {
		delete process.env.INSECURE_PATHS;
	});

	afterEach(() => {
		delete process.env.INSECURE_PATHS;
	});

	it('getInsecurePaths with only defaults', () => {
		const result = getInsecurePaths();
		expect(result).toEqual({
			paths: DEFAULT_INSECURE_PATHS
		});
	});

	it('getInsecurePaths with env paths', () => {
		process.env.INSECURE_PATHS = '/abc, /def';
		const result = getInsecurePaths();
		expect(result).toEqual({
			paths: [...DEFAULT_INSECURE_PATHS, '/abc', '/def']
		});
	});
});
