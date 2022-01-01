import { MongoMemoryServer } from 'mongodb-memory-server';
import * as TEU from '../../src/function/TaskEitherUtils';

export const createMongoServer = (): TEU.TaskEither<MongoMemoryServer> =>
	TEU.tryCatch(async () => {
		return await MongoMemoryServer.create();
	});
