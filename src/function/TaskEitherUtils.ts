import * as TE from 'fp-ts/TaskEither';
import * as T from 'fp-ts/Task';
import { unknownToError } from './unknownToError';
import { pipe } from 'fp-ts/function';

export const tryCatch = <T>(fn: () => Promise<T>): TE.TaskEither<Error, T> =>
	TE.tryCatch(fn, unknownToError);

export type TaskEither<T> = TE.TaskEither<Error, T>;

export const throwIfLeft = <V>(te: TaskEither<V>): T.Task<V> =>
	pipe(
		te,
		TE.fold(
			(_) => {
				throw _;
			},
			(_) => T.of(_)
		)
	);

export function multiTypeSequence<A>(a: TaskEither<A>): TaskEither<A>;
export function multiTypeSequence<A, B>(
	a: TaskEither<A>,
	b: TaskEither<B>
): TaskEither<[A, B]>;
export function multiTypeSequence<A, B>(
	a: TaskEither<A>,
	b?: TaskEither<B>
): TaskEither<unknown> {
	switch (arguments.length) {
		case 1:
			return a;
		case 2:
			return pipe(
				a,
				TE.bindTo('a'),
				TE.bind('b', () => b!),
				TE.map(({ a, b }) => [a, b])
			);
		default:
			throw new Error(
				`Unsupported number of arguments: ${arguments.length}`
			);
	}
}
