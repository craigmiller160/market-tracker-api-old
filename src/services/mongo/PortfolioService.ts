import * as TE from 'fp-ts/TaskEither';
import {
	Portfolio,
	PortfolioModel,
	PortfolioModelInstanceType,
	portfolioToModel
} from '../../mongo/models/PortfolioModel';
import { pipe } from 'fp-ts/function';
import * as A from 'fp-ts/Array';
import * as TEU from '../../function/TaskEitherUtils';

const getCurrentUserId = () => 1;

export const findPortfoliosForUser = (): TEU.TaskEither<Portfolio[]> => {
	const userId = getCurrentUserId();
	return TEU.tryCatch(() => PortfolioModel.find({ userId }).exec());
};

const replacePortfoliosForUser = (
	userId: number,
	portfolioModels: PortfolioModelInstanceType[]
): TEU.TaskEither<Portfolio[]> =>
	pipe(
		TEU.tryCatch(() => PortfolioModel.deleteMany({ userId }).exec()),
		TE.chain(() =>
			TEU.tryCatch(async () => PortfolioModel.insertMany(portfolioModels))
		)
	);

export const savePortfoliosForUser = (
	portfolios: Portfolio[]
): TEU.TaskEither<void> => {
	const userId = getCurrentUserId();

	const portfolioModels = pipe(
		portfolios,
		A.map((_) =>
			portfolioToModel({
				..._,
				userId
			})
		)
	);

	return pipe(
		TEU.tryCatch(() => PortfolioModel.startSession()),
		TE.chainFirst((session) =>
			TEU.tryCatch(() =>
				session.withTransaction(
					replacePortfoliosForUser(userId, portfolioModels)
				)
			)
		),
		TE.chain((session) => TEU.tryCatch(() => session.endSession()))
	);
};
