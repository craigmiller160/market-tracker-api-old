import {
	createMongoTestServer,
	MongoTestServer,
	stopMongoTestServer
} from '../../testutils/mongoServer';
import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import * as T from 'fp-ts/Task';

describe('portfolios', () => {
	let mongoTestServer: MongoTestServer;
	beforeAll(async () => {
		await pipe(
			createMongoTestServer(),
			TE.fold(
				(_) => {
					throw _;
				},
				(_) => {
					mongoTestServer = _;
					return T.of(_);
				}
			)
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
