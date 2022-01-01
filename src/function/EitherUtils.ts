import * as E from 'fp-ts/Either';
import { unknownToError } from './unknownToError';

export const tryCatch = <T>(fn: () => T): Either<T> =>
	E.tryCatch(fn, unknownToError);

export type Either<T> = E.Either<Error, T>;
