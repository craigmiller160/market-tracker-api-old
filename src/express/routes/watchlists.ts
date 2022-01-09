import { RouteCreator } from './RouteCreator';
import { pipe } from 'fp-ts/function';
import {
	findWatchlistsForUser,
	saveWatchlistsForUser
} from '../../services/mongo/WatchlistService';
import * as TE from 'fp-ts/TaskEither';
import { Request } from 'express';
import { Watchlist } from '../../mongo/models/WatchlistModel';
import { secure } from '../TokenValidation';

export const getWatchlists: RouteCreator = (app) =>
	app.get(
		'/watchlists',
		secure((req, res) =>
			pipe(
				findWatchlistsForUser(),
				TE.map((_) => res.json(_))
			)()
		)
	);

export const saveWatchlists: RouteCreator = (app) =>
	app.post(
		'/watchlists',
		secure((req: Request<unknown, unknown, Watchlist[]>, res) =>
			pipe(
				saveWatchlistsForUser(req.body),
				TE.chain(findWatchlistsForUser),
				TE.map((_) => res.json(_))
			)()
		)
	);
