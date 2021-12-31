import * as O from 'fp-ts/Option';
import * as E from 'fp-ts/Either';

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

const expressListen = (port: number): E.Either<Error, Server> =>
	E.tryCatch(
		() =>
			app.listen(
				port,
				logInfo(`Market Tracker API listening on port ${port}`)
			),
		unknownToError
	);

export const startExpressServer = (): E.Either<Error, Server> => {
	const port = pipe(
		O.fromNullable(process.env.EXPRESS_PORT),
		O.chain(safeParseInt),
		O.getOrElse(() => 8080)
	);

	return expressListen(port);
};
