import { RouteCreator } from './RouteCreator';
import { PortfolioModel } from '../../mongo/models/PortfolioModel';
import * as TE from 'fp-ts/TaskEither';
import { Portfolio } from '../../mongo/models/Portfolio';
import { unknownToError } from '../../function/unknownToError';
import { pipe } from 'fp-ts/function';

const findPortfolioModel = (): TE.TaskEither<Error, Portfolio[]> =>
	TE.tryCatch(() => PortfolioModel.find().exec(), unknownToError);

export const getPortfolios: RouteCreator = (app) => {
	app.get('/portfolios', async (req, res) => {
		pipe(findPortfolioModel(), TE.map(res.json));
	});
};
