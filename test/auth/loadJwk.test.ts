import { restClient } from '../../src/services/RestClient';
import MockAdapter from 'axios-mock-adapter';
import '@relmify/jest-fp-ts';
import jwkToPem from 'jwk-to-pem';
import { JwkSet, loadJwk } from '../../src/auth/loadJwk';

const mockRestClient = new MockAdapter(restClient);

jest.mock('jwk-to-pem', () => {
	const { JWK } = jest.requireActual('jwk-to-pem');
	return {
		default: jest.fn(),
		JWK
	};
});

const jwkSet: JwkSet = {
	keys: [
		{
			kty: 'EC',
			crv: '',
			x: '',
			y: ''
		}
	]
};

const jwkToPemMock = jwkToPem as jest.Mock;

describe('loadJwk', () => {
	beforeEach(() => {
		jest.resetAllMocks();
		mockRestClient.reset();
		process.env.AUTH_SERVER_HOST = 'https://authServerHost';
	});

	afterEach(() => {
		process.env.AUTH_SERVER_HOST = undefined;
	});

	it('loads the JWK as a PEM', async () => {
		mockRestClient.onGet('https://authServerHost/jwk').reply(200, jwkSet);
		jwkToPemMock.mockImplementation(() => 'Success');

		const result = await loadJwk()();
		expect(result).toEqualRight({
			key: 'Success'
		});
	});
});
