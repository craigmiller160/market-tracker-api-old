import { Express } from 'express';
import { getPortfolios, savePortfolios } from './portfolios';
import { getWatchlists, saveWatchlists } from './watchlists';

export const createRoutes = (app: Express) => {
	getPortfolios(app);
	savePortfolios(app);
	getWatchlists(app);
	saveWatchlists(app);
};
