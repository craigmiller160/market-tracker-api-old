import * as O from 'fp-ts/Option';
import * as E from 'fp-ts/Either';

import bodyParer from 'body-parser';
import { logError, logInfo } from '../logger';
import { pipe } from 'fp-ts/function';
import express, { Express } from 'express';
import { Server } from 'http';
import { unknownToError } from '../function/unknownToError';
import { createRoutes } from './routes';

const app = express();
app.use(bodyParer.json());
createRoutes(app);

// TODO how do I prevent errors from crashing the whole app?

const safeParseInt = (text: string): O.Option<number> =>
	pipe(
		E.tryCatch(
			() => parseInt(text),
			(error) =>
				logError(
					`Error parsing EXPRESS_PORT environment variable: ${error}`
				)
		),
		O.fromEither
	);

const expressListen = (port: number): E.Either<Error, Server> =>
	E.tryCatch(
		() =>
			app.listen(
				port,
				logInfo(`Market Tracker API listening on port ${port}`)
			),
		unknownToError
	);

export interface ExpressServer {
	readonly server: Server;
	readonly app: Express;
}

export const startExpressServer = (): E.Either<Error, ExpressServer> => {
	const port = pipe(
		O.fromNullable(process.env.EXPRESS_PORT),
		O.chain(safeParseInt),
		O.getOrElse(() => 8080)
	);

	return pipe(
		expressListen(port),
		E.map((_) => ({
			server: _,
			app
		}))
	);
};
