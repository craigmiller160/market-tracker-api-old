import { RouteCreator } from './RouteCreator';
import * as TE from 'fp-ts/TaskEither';
import { Portfolio } from '../../mongo/models/PortfolioModel';
import { pipe } from 'fp-ts/function';
import { Express, NextFunction, Request, Response } from 'express';
import {
	findPortfoliosForUser,
	savePortfoliosForUser
} from '../../services/mongo/PortfolioService';

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
		(req: Request<unknown, unknown, Portfolio[]>, res) =>
			pipe(
				savePortfoliosForUser(req.body),
				TE.chain(findPortfoliosForUser),
				TE.map((_) => res.json(_))
			)()
	);
