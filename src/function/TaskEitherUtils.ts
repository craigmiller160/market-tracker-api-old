import * as TE from 'fp-ts/TaskEither';
import { unknownToError } from './unknownToError';

export const tryCatch = <T>(fn: () => Promise<T>): TE.TaskEither<Error, T> =>
	TE.tryCatch(fn, unknownToError);

export type TaskEither<T> = TE.TaskEither<Error, T>;
