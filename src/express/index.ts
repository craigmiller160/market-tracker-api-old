import * as O from 'fp-ts/Option';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';

import { logError, logInfo } from '../logger';
import { pipe } from 'fp-ts/function';
import express from 'express';
import { Server } from 'http';
import { unknownToError } from '../function/unknownToError';

const app = express();

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

const port = pipe(
	O.fromNullable(process.env.EXPRESS_PORT),
	O.chain(safeParseInt),
	O.getOrElse(() => 8080)
);

const expressListen = (port: number): TE.TaskEither<Error, Server> =>
	TE.tryCatch(
		() => new Promise((resolve) => app.listen(port, resolve)),
		unknownToError
	);

export const startExpressServer = (): TE.TaskEither<Error, Server> =>
	pipe(
		expressListen(port),
		TE.chainFirst(() =>
			TE.fromIO(logInfo(`Market Tracker API listening on port ${port}`))
		)
	);
