import * as EU from '../function/EitherUtils';
import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as E from 'fp-ts/Either';

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

export const getConnectionString = (): EU.Either<string> => {
	return pipe(
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
		E.fromOption(
			() =>
				new Error('Missing environment variables for Mongo connection')
		)
	);
};
