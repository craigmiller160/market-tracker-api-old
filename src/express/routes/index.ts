import { Express } from 'express';
import { healthcheck } from './healthcheck';
import { getUserDetails } from './user';
import { createPortfolioRoutes } from './portfolios';
import { createWatchlistRoutes } from './watchlists';

export const createRoutes = (app: Express) => {
	createPortfolioRoutes(app);
	createWatchlistRoutes(app);
	healthcheck(app);
	getUserDetails(app);
};
