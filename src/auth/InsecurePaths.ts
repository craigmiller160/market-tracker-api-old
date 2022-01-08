import * as O from 'fp-ts/Option';
import * as A from 'fp-ts/Array';
import { pipe } from 'fp-ts/function';

export interface InsecurePaths {
	readonly paths: string[];
}

const DEFAULT_INSECURE_PATHS = ['/login', '/logout'];

const getInsecurePathsEnv = (): string[] =>
	pipe(
		O.fromNullable(process.env.INSECURE_PATHS),
		O.map((_) => _.split(',')),
		O.getOrElse((): string[] => []),
		A.map((_) => _.trim())
	);

export const getInsecurePaths = (): string[] => [
	...DEFAULT_INSECURE_PATHS,
	...getInsecurePathsEnv()
];
