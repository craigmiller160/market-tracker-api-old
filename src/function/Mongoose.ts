import * as TE from 'fp-ts/TaskEither';
import * as TEU from './TaskEitherUtils';
import * as EU from './EitherUtils';
import { ClientSession } from 'mongoose';
import { pipe } from 'fp-ts/function';

export const withTransaction =
	<T>(fn: () => Promise<EU.Either<T>>) =>
	(sessionTE: TEU.TaskEither<ClientSession>): TEU.TaskEither<T> =>
		pipe(
			sessionTE,
			TE.chain((session) =>
				pipe(
					TEU.tryCatch(() =>
						session.withTransaction<EU.Either<T>>(fn)
					),
					TE.chain(TE.fromEither)
				)
			)
		);
