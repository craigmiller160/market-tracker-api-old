// import './processErrorHandling';
// import { connectToMongo } from './mongo';
// import { pipe } from 'fp-ts/function';
// import * as TE from 'fp-ts/TaskEither';
// import { startExpressServer } from './express';
// import { logError, logInfo } from './logger';
// import { loadTokenKey } from './auth/TokenKey';
//
// logInfo('Starting application')();

// pipe(
// 	loadTokenKey(),
// 	TE.chainFirst(connectToMongo),
// 	TE.chain(startExpressServer),
// 	TE.mapLeft((_) => {
// 		logError('Error starting application', _)();
// 		process.exit(1);
// 		return _;
// 	})
// )();

/* eslint-disable */

import {getConnectionString} from './mongo/connectionString';
import {pipe} from 'fp-ts/function';
import * as E from 'fp-ts/Either';
import { identity } from 'fp-ts/function';
import mongoose from 'mongoose';

const connectString = pipe(
	getConnectionString(),
	E.fold(
		(ex) => {
			throw ex
		},
		identity
	)
);

console.log('Connecting to Mongoose', connectString);
mongoose.connect(connectString)
	.then(() => {
		console.log('Successfully connected');
	})
	.catch((ex) => {
		console.error('Error connecting');
		console.error(ex);
	})
