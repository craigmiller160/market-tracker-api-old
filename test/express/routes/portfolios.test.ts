import {
	createMongoTestServer,
	MongoTestServer,
	stopMongoTestServer
} from '../../testutils/mongoServer';
import { pipe } from 'fp-ts/function';
import * as TEU from '../../../src/function/TaskEitherUtils';

describe('portfolios', () => {
	let mongoTestServer: MongoTestServer;
	beforeAll(async () => {
		await pipe(
			createMongoTestServer(),
			TEU.mapOrThrow((_) => {
				mongoTestServer = _;
				return _;
			})
		)();
	});

	afterAll(() => {
		stopMongoTestServer(mongoTestServer);
	});

	it('getPortfolios', () => {
		throw new Error();
	});

	it('savePortfolios', () => {
		throw new Error();
	});
});
