import { Express } from 'express';
import { getPortfolios } from './portfolios';

export const createRoutes = (app: Express) => {
	getPortfolios(app);
};
