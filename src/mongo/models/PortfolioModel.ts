import { model, Schema } from 'mongoose';
import { Portfolio } from './Portfolio';

const portfolioSchema = new Schema<Portfolio>({
	userId: {
		type: Number,
		required: true
	},
	portfolioName: {
		type: String,
		required: true
	},
	stocks: [String],
	cryptos: [String]
});

export const PortfolioModel = model<Portfolio>('portfolio', portfolioSchema);
export type PortfolioModelType = typeof PortfolioModel;
