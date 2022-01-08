import { restClient } from '../../src/services/RestClient';
import MockAdapter from 'axios-mock-adapter';
import '@relmify/jest-fp-ts';

const mockRestClient = new MockAdapter(restClient);

describe('loadJwk', () => {
	beforeEach(() => {
		mockRestClient.reset();
		process.env.AUTH_SERVER_HOST = 'https://authServerHost';
	});

	afterEach(() => {
		process.env.AUTH_SERVER_HOST = undefined;
	});

	it('loads the JWK as a PEM', () => {
		throw new Error();
	});
});
