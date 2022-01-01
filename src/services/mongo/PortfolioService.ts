import * as TE from 'fp-ts/TaskEither';
import {
	Portfolio,
	PortfolioModel,
	PortfolioModelInstanceType
} from '../../mongo/models/PortfolioModel';
import { unknownToError } from '../../function/unknownToError';
import { pipe } from 'fp-ts/function';
import * as A from 'fp-ts/Array';
import * as TEU from '../../function/TaskEitherUtils';
import * as MO from '../../function/Mongoose';

const getCurrentUserId = () => 1;

export const findPortfoliosForUser = (): TEU.TaskEither<
	ReadonlyArray<Portfolio>
> => {
	const userId = getCurrentUserId();
	return TE.tryCatch(
		() => PortfolioModel.find({ userId }).exec(),
		unknownToError
	);
};

const replacePortfoliosForUser = (
	userId: number,
	portfolioModels: PortfolioModelInstanceType[]
): TEU.TaskEither<Portfolio[]> =>
	pipe(
		TEU.tryCatch(PortfolioModel.deleteOne({ userId }).exec),
		TE.chain(() =>
			TEU.tryCatch(() => PortfolioModel.insertMany(portfolioModels))
		)
	);

export const savePortfoliosForUser = (
	portfolios: Portfolio[]
): TEU.TaskEither<Portfolio[]> => {
	const userId = getCurrentUserId();

	const portfolioModels = pipe(
		portfolios,
		A.map(
			(_) =>
				new PortfolioModel({
					..._,
					userId
				})
		)
	);

	return pipe(
		TEU.tryCatch(PortfolioModel.startSession),
		TE.bindTo('session'),
		TE.bind('portfolios', ({ session }) =>
			MO.withTransaction(
				session,
				replacePortfoliosForUser(userId, portfolioModels)
			)
		),
		TE.chainFirst(({ session }) => TEU.tryCatch(session.endSession)),
		TE.map(({ portfolios }): Portfolio[] => portfolios)
	);
};
