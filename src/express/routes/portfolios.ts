import { RouteCreator } from './RouteCreator';
import { PortfolioModel } from '../../mongo/models/PortfolioModel';
import * as TE from 'fp-ts/TaskEither';
import { Portfolio } from '../../mongo/models/Portfolio';
import { pipe } from 'fp-ts/function';
import { Request } from 'express';
import { findPortfoliosForUser, savePortfoliosForUser } from '../../services/mongo/PortfolioService';

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
			const result = await savePortfoliosForUser(req.body)();
			res.json(result);
		}
	);
