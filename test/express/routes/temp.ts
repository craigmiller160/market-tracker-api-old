import * as EU from '../../../src/function/EitherUtils';
import * as E from 'fp-ts/Either';

export const getConnectionString = (): EU.Either<string> => E.right('Hello World');
