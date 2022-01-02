import * as TE from 'fp-ts/TaskEither';
import * as TEU from './TaskEitherUtils';
import * as EU from './EitherUtils';
import { ClientSession } from 'mongoose';
import { pipe } from 'fp-ts/function';

export const withTransaction = (
	session: ClientSession,
	fn: () => Promise<any>
): TEU.TaskEither<void> =>
	pipe(
		TEU.tryCatch(() => session.withTransaction(fn))
	);
