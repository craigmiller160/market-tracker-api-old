import { RouteCreator } from './RouteCreator';
import { PortfolioModel } from '../../mongo/models/PortfolioModel';
import * as TE from 'fp-ts/TaskEither';
import { Portfolio } from '../../mongo/models/Portfolio';
import { pipe } from 'fp-ts/function';
import { Request } from 'express';
import { findPortfoliosForUser } from '../../services/mongo/PortfolioService';

export const getPortfolios: RouteCreator = (app) =>
	app.get('/portfolios', (req, res) =>
		pipe(
            findPortfoliosForUser(),
			TE.map((_) => res.json(_))
		)()
	);

export const savePortfolios: RouteCreator = (app) =>
	app.post(
		'/portfolios',
		async (req: Request<unknown, unknown, Portfolio[]>, res) => {
			// TODO how to do transactions?
			const portfolioModels = req.body.map((_) => new PortfolioModel(_));
			await PortfolioModel.deleteOne({ userId: 1 }).exec();
			await PortfolioModel.insertMany(portfolioModels);
			const result = await PortfolioModel.find().exec();
			res.json(result);
		}
	);
