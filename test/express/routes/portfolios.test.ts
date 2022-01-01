import { getConnectionString } from '../../../src/mongo/connectionString';

jest.mock('../../../src/mongo/connectionString', () => jest.requireActual('./temp'));

describe('portfolios', () => {
	it('getPortfolios', () => {
		console.log(getConnectionString());
		throw new Error();
	});

	it('savePortfolios', () => {
		throw new Error();
	});
});
