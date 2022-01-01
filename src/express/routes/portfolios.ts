import { RouteCreator } from './RouteCreator';
import { PortfolioModel } from '../../mongo/models/PortfolioModel';

export const getPortfolios: RouteCreator = (app) => {
	app.get('/portfolios', async (req, res) => {
        const result = await PortfolioModel.find().exec();
        res.json(result);
	});
};
