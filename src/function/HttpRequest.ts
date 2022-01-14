import { Request } from 'express';
import * as O from 'fp-ts/Option';
import { pipe } from 'fp-ts/function';
import * as EU from './EitherUtils';

export const getHeader = (req: Request, key: string): O.Option<string> =>
	pipe(
		EU.tryCatch(() => O.fromNullable(req.header(key))),
		O.fromEither,
		O.flatten
	);
