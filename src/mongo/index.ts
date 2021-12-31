import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';

interface MongoEnv {
	readonly hostname: string;
	readonly port: string;
	readonly user: string;
	readonly password: string;
	readonly adminDb: string;
	readonly db: string;
}

const createConnectionString = (env: MongoEnv): string =>
	`mongodb://${env.user}:${env.password}@${env.hostname}:${env.port}/${env.db}?authSource=admin`;

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

pipe(
	O.sequenceArray([
		O.fromNullable(process.env.MONGO_HOSTNAME),
		O.fromNullable(process.env.MONGO_PORT),
		O.fromNullable(process.env.MONGO_USER),
		O.fromNullable(process.env.MONGO_PASSWORD),
		O.fromNullable(process.env.MONGO_ADMIN_DB),
		O.fromNullable(process.env.MONGO_DB)
	]),
	O.map(envToMongoEnv),
	O.map(createConnectionString),
	TE.fromOption(() => new Error(''))
);
