import * as TE from 'fp-ts/TaskEither';
import * as T from 'fp-ts/Task';
import { unknownToError } from './unknownToError';
import { pipe } from 'fp-ts/function';
import { match } from 'ts-pattern';

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
export function multiTypeSequence<A, B, C>(
	a: TaskEither<A>,
	b: TaskEither<B>,
	c: TaskEither<C>
): TaskEither<[A, B, C]>;
export function multiTypeSequence<A, B, C, D, E, F, G>(
	a: TaskEither<A>,
	b?: TaskEither<B>,
	c?: TaskEither<C>,
	d?: TaskEither<D>,
	e?: TaskEither<E>,
	f?: TaskEither<F>,
	g?: TaskEither<G>
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
		case 3:
			return pipe(
				a,
				TE.bindTo('a'),
				TE.bind('b', () => b!),
				TE.bind('c', () => c!),
				TE.map(({ a, b, c }) => [a, b, c])
			);
		default:
			throw new Error(
				`Unsupported number of arguments: ${arguments.length}`
			);
	}
}
