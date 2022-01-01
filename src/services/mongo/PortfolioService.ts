import * as TE from 'fp-ts/TaskEither';
import { Portfolio } from '../../mongo/models/Portfolio';
import { PortfolioModel } from '../../mongo/models/PortfolioModel';
import { unknownToError } from '../../function/unknownToError';
import { pipe } from 'fp-ts/function';
import * as A from 'fp-ts/Array';

const getCurrentUserId = () => 1;

export const findPortfoliosForUser = (): TE.TaskEither<
	Error,
	ReadonlyArray<Portfolio>
> => {
	const userId = getCurrentUserId();
	return TE.tryCatch(
		() => PortfolioModel.find({ userId }).exec(),
		unknownToError
	);
};

const tryCatch = <T>(fn: () => Promise<T>): TE.TaskEither<Error,T> =>
	TE.tryCatch(fn, unknownToError);

export const savePortfoliosForUser = (
	portfolios: Portfolio[]
): TE.TaskEither<Error, void> => {
	const userId = getCurrentUserId();

	const portfolioModels = pipe(
		portfolios,
		A.map((_: Portfolio) => new PortfolioModel({
			..._,
			userId
		}))
	);

	return pipe(
		tryCatch(PortfolioModel.startSession),
		TE.map((session) => session.withTransaction(() => {
			return pipe(
				tryCatch(PortfolioModel.deleteOne({ userId }).exec),
				TE.chain(() => tryCatch(() => PortfolioModel.insertMany(portfolioModels)))
			)()
		})),
		TE.chain((session) => tryCatch(() => session.endSession()))
	);
};
