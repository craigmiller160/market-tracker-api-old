import { Express } from 'express';
import { getPortfolios, savePortfolios } from './portfolios';
import { getWatchlists, saveWatchlists } from './watchlists';
import { healthcheck } from './healthcheck';
import { getUserDetails } from './user';

export const createRoutes = (app: Express) => {
	getPortfolios(app);
	savePortfolios(app);
	getWatchlists(app);
	saveWatchlists(app);
	healthcheck(app);
	getUserDetails(app);
};
