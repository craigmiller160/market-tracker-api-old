import * as EU from '../function/EitherUtils';
import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as E from 'fp-ts/Either';
import { match } from 'ts-pattern';
import { logDebug } from '../logger';

interface MongoEnv {
	readonly hostname: string;
	readonly port: string;
	readonly user: string;
	readonly password: string;
	readonly adminDb: string;
	readonly db: string;
}

const createConnectionString = (env: MongoEnv): string =>
	`mongodb://${env.user}:${env.password}@${env.hostname}:${env.port}/${env.db}?authSource=${env.adminDb}&tls=true&tlsAllowInvalidCertificates=true&tlsAllowInvalidHostnames=true`;

const logConnectionStringInDev = (connectionString: string): string =>
	match(process.env.NODE_ENV)
		.with('development', () => {
			logDebug(`Mongo Connection String: ${connectionString}`)();
			return connectionString;
		})
		.otherwise(() => connectionString);

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

const getMongoPasswordEnv = (): O.Option<string> =>
	pipe(
		O.fromNullable(process.env.MONGO_PASSWORD),
		O.getOrElse(() => process.env.MONGO_ROOT_PASSWORD),
		O.fromNullable
	);

export const getConnectionString = (): EU.Either<string> => {
	return pipe(
		O.sequenceArray([
			O.fromNullable(process.env.MONGO_HOSTNAME),
			O.fromNullable(process.env.MONGO_PORT),
			O.fromNullable(process.env.MONGO_USER),
			getMongoPasswordEnv(),
			O.fromNullable(process.env.MONGO_AUTH_DB),
			O.fromNullable(process.env.MONGO_DB)
		]),
		O.map(envToMongoEnv),
		O.map(createConnectionString),
		O.map(logConnectionStringInDev),
		E.fromOption(
			() =>
				new Error('Missing environment variables for Mongo connection')
		)
	);
};
