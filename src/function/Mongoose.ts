import * as TE from 'fp-ts/TaskEither';
import * as TEU from './TaskEitherUtils';
import * as EU from './EitherUtils';
import { ClientSession } from 'mongoose';
import { pipe } from 'fp-ts/function';

export const withTransaction = <T>(
	session: ClientSession,
	fn: () => Promise<EU.Either<T>>
): TEU.TaskEither<T> =>
	pipe(
		TEU.tryCatch(async () => {
			const result = await session.withTransaction<EU.Either<T>>(fn);
			console.log('WithTransactionResult', result);
			return result;
		}),
		TE.chain((_) => {
			console.log('FromEither', _)
			const result = TE.fromEither(_)
			console.log('AfterFromEither');
			return result
		})
	);
