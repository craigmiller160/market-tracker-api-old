import { RouteCreator } from './RouteCreator';
import * as TE from 'fp-ts/TaskEither';
import { Portfolio } from '../../mongo/models/PortfolioModel';
import { pipe } from 'fp-ts/function';
import { Request } from 'express';
import {
	findPortfoliosForUser,
	savePortfoliosForUser
} from '../../services/mongo/PortfolioService';
import passport from 'passport';

export const getPortfolios: RouteCreator = (app) =>
	app.get(
		'/portfolios',
		passport.authenticate('jwt', { session: false }),
		(req, res) =>
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
