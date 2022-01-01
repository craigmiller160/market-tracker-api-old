import { model, Schema } from 'mongoose';

export interface Watchlist {
    userId: number;
    watchlistName: string;
    stocks: string[];
    cryptos: string[];
}

const watchlistSchema = new Schema<Watchlist>({
    userId: {
        type: Number,
        required: true
    },
    watchlistName: {
        type: String,
        required: true
    },
    stocks: [String],
    cryptos: [String]
});

export const WatchlistModel = model<Watchlist>('watchlist', watchlistSchema);
export type WatchlistModelType = typeof WatchlistModel;

const exampleWatchlist = new WatchlistModel();

export type WatchlistModelInstanceType = typeof exampleWatchlist;
