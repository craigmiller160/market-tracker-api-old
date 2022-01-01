import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import * as TEU from '../function/TaskEitherUtils';
import mongoose from 'mongoose';
import { logInfo } from '../logger';
import { getConnectionString } from './connectionString';

const connectToMongoose = (
	connectionString: string
): TEU.TaskEither<typeof mongoose> =>
	TEU.tryCatch(() => mongoose.connect(connectionString));

export const connectToMongo = (): TEU.TaskEither<typeof mongoose> =>
	pipe(
		getConnectionString(),
		TE.fromEither,
		TE.chain(connectToMongoose),
		TE.chainFirst(() => TE.fromIO(logInfo('Connected to MongoDB')))
	);
