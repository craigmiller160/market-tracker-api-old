import * as O from 'fp-ts/Option';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import * as TEU from '../function/TaskEitherUtils';

import bodyParer from 'body-parser';
import { logError, logger, logInfo } from '../logger';
import { pipe } from 'fp-ts/function';
import express, { Express } from 'express';
import { Server } from 'http';
import { createRoutes } from './routes';
import { setupErrorHandler } from './errorHandler';
import https from 'https';
import { httpsOptions } from './tls';
import { setupRequestLogging } from './requestLogging';

const app = express();
app.use(bodyParer.json());
setupRequestLogging(app);
createRoutes(app);
setupErrorHandler(app);

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

const expressListen = (port: number): TEU.TaskEither<Server> =>
	TEU.tryCatch(
		() =>
			new Promise((resolve, reject) => {
				const server = https
					.createServer(httpsOptions, app)
					.listen(port, (err?: Error) => {
						pipe(
							O.fromNullable(err),
							O.fold(
								() => {
									logInfo(
										`Market Tracker API listening on port ${port}`
									)();
									resolve(server);
								},
								(_) => reject(_)
							)
						);
					});
			})
	);

export interface ExpressServer {
	readonly server: Server;
	readonly app: Express;
}

export const startExpressServer = (): TEU.TaskEither<ExpressServer> => {
	const port = pipe(
		O.fromNullable(process.env.EXPRESS_PORT),
		O.chain(safeParseInt),
		O.getOrElse(() => 8080)
	);

	logger.debug('Starting server');

	return pipe(
		expressListen(port),
		TE.map((_) => ({
			server: _,
			app
		}))
	);
};
