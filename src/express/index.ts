import * as O from 'fp-ts/Option';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import * as TEU from '../function/TaskEitherUtils';

import bodyParer from 'body-parser';
import { logError, logInfo } from '../logger';
import { pipe } from 'fp-ts/function';
import express, { Express, Request, Response, NextFunction } from 'express';
import { Server } from 'http';
import { createRoutes } from './routes';

const app = express();
app.use(bodyParer.json());
createRoutes(app);
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
	// TODO improve this
	res.status(500);
	res.send(err.message);
});
// TODO improve this too
process.on('uncaughtException', (err) => {
	console.log('UncaughtException', err);
});

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

const expressListen = (port: number): TEU.TaskEither<Server> =>
	TEU.tryCatch(
		() =>
			new Promise((resolve, reject) => {
				const server = app.listen(port, (err?: Error) => {
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

	return pipe(
		expressListen(port),
		TE.map((_) => ({
			server: _,
			app
		}))
	);
};
