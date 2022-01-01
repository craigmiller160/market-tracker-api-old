import * as TE from 'fp-ts/TaskEither';
import { Portfolio } from '../../mongo/models/Portfolio';
import { PortfolioModel } from '../../mongo/models/PortfolioModel';
import { unknownToError } from '../../function/unknownToError';

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

export const savePortfoliosForUser = (
	portfolios: ReadonlyArray<Portfolio>
): TE.TaskEither<Error, void> => {
	// TODO how to do transactions?
	const userId = getCurrentUserId();
	const portfolioModels = portfolios.map((_) => new PortfolioModel({
		..._,
		userId
	}));
	return TE.tryCatch(
		async () => {
			const session = await PortfolioModel.startSession();
			session.withTransaction(async () => {
				await PortfolioModel.deleteOne({ userId }).exec();
				await PortfolioModel.insertMany(portfolioModels);
			});
			await session.endSession();
		},
		unknownToError
	)
};
