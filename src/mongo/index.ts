import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';
import * as TEU from '../function/TaskEitherUtils';
import mongoose from 'mongoose';
import { logInfo } from '../logger';

interface MongoEnv {
	readonly hostname: string;
	readonly port: string;
	readonly user: string;
	readonly password: string;
	readonly adminDb: string;
	readonly db: string;
}

const createConnectionString = (env: MongoEnv): string =>
	`mongodb://${env.user}:${env.password}@${env.hostname}:${env.port}/${env.db}?authSource=${env.adminDb}`;

const envToMongoEnv = ([
	hostname,
	port,
	user,
	password,
	adminDb,
	db
]: readonly string[]): MongoEnv => ({
	hostname,
	port,
	user,
	password,
	adminDb,
	db
});

const connectToMongoose = (
	connectionString: string
): TEU.TaskEither<typeof mongoose> =>
	TEU.tryCatch(() => mongoose.connect(connectionString));

export const connectToMongo = (): TEU.TaskEither<typeof mongoose> =>
	pipe(
		O.sequenceArray([
			O.fromNullable(process.env.MONGO_HOSTNAME),
			O.fromNullable(process.env.MONGO_PORT),
			O.fromNullable(process.env.MONGO_USER),
			O.fromNullable(process.env.MONGO_PASSWORD),
			O.fromNullable(process.env.MONGO_AUTH_DB),
			O.fromNullable(process.env.MONGO_DB)
		]),
		O.map(envToMongoEnv),
		O.map(createConnectionString),
		TE.fromOption(
			() =>
				new Error('Missing environment variables for Mongo connection')
		),
		TE.chain(connectToMongoose),
		TE.chainFirst(() => TE.fromIO(logInfo('Connected to MongoDB')))
	);
