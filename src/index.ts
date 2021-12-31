import { connectToMongo } from './mongo';
import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import { startExpressServer } from './express';

pipe(
	connectToMongo(),
	TE.chain(() => TE.fromEither(startExpressServer()))
)();
