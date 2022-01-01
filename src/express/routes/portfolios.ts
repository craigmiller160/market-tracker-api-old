import { RouteCreator } from './RouteCreator';

export const getPortfolios: RouteCreator = (app) => {
	app.get('/portfolios', (req, res) => {
		throw new Error();
	});
};
