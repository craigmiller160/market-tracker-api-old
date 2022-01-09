import { ec } from 'elliptic';
import * as E from 'fp-ts/Either';
import * as EU from '../../src/function/EitherUtils';

const ecInstance = new ec('secp256k1');

export const createKeyPair = (): E.Either<Error, ec.KeyPair> =>
	EU.tryCatch(() => ecInstance.genKeyPair());
