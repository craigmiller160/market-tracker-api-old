import { MongoMemoryServer } from 'mongodb-memory-server';
import * as TEU from '../../src/function/TaskEitherUtils';
import mongoose, { Mongoose } from 'mongoose';

export type MongoTestServer = [MongoMemoryServer, Mongoose];

export const createMongoTestServer = (): TEU.TaskEither<MongoTestServer> =>
	TEU.tryCatch(async () => {
		const memoryServer: MongoMemoryServer =
			await MongoMemoryServer.create();
		const mongooseInstance: Mongoose = await mongoose.connect(
			memoryServer.getUri()
		);
		return [memoryServer, mongooseInstance];
	});

export const stopMongoTestServer = (
	mongoTestServer: MongoTestServer
): TEU.TaskEither<void> =>
	TEU.tryCatch(async () => {
		await mongoTestServer[1].disconnect();
		await mongoTestServer[0].stop();
	});
