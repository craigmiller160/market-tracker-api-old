import { model, Schema } from 'mongoose';

export interface Portfolio {
	userId: number;
	portfolioName: string;
	stocks: string[];
	cryptos: string[];
}

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

const exampleModel = new PortfolioModel();

export type PortfolioModelInstanceType = typeof exampleModel;

export const portfolioToModel = (
	portfolio: Portfolio
): PortfolioModelInstanceType => new PortfolioModel(portfolio);
