import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import * as TEU from '../function/TaskEitherUtils';
import mongoose, { Mongoose } from 'mongoose';
import { logger, logInfo } from '../logger';
import { getConnectionString } from './connectionString';
import { MongoClient } from 'mongodb';

const connectToMongoose = (
	connectionString: string
): TEU.TaskEither<typeof mongoose> =>
	TEU.tryCatch(() => mongoose.connect(connectionString));

// TODO delete this whole thing
const connectWithMongoClient = (
	connectionString: string
): TE.TaskEither<Error, unknown> => {
	logger.debug('Trying to connect with MongoClient');
	return pipe(
		TEU.tryCatch(() => MongoClient.connect(connectionString)),
		TE.map(() => {
			logger.debug('Successfully connected with MongoClient');
		}),
		TE.mapLeft((e) => {
			logger.error('Failed to connect with MongoClient');
			logger.error(e);
			return e;
		})
	);
};

export const connectToMongo = (): TEU.TaskEither<Mongoose> =>
	pipe(
		getConnectionString(),
		TE.fromEither,
		TE.chainFirst(connectWithMongoClient),
		TE.chain(connectToMongoose),
		TE.chainFirst(() => TE.fromIO(logInfo('Connected to MongoDB')))
	);
