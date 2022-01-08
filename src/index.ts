import './processErrorHandling';
import { connectToMongo } from './mongo';
import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import { startExpressServer } from './express';
import { logError, logInfo } from './logger';
import { loadJwk } from './auth/loadJwk';

logInfo('Starting application')();

pipe(
	loadJwk(),
	TE.chainFirst(connectToMongo),
	TE.chain(startExpressServer),
	TE.mapLeft((_) => {
		logError('Error starting application', _)();
		process.exit(1);
		return _;
	})
)();
