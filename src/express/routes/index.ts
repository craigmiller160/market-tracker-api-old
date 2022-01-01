import { Express } from 'express';
import { getPortfolios, savePortfolios } from './portfolios';

export const createRoutes = (app: Express) => {
	getPortfolios(app);
	savePortfolios(app);
};
