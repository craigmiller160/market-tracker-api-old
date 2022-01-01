import * as TEU from '../../function/TaskEitherUtils';
import { Watchlist, WatchlistModel } from '../../mongo/models/WatchlistModel';

const getCurrentUserId = () => 1;

export const findWatchlistsForUser = (): TEU.TaskEither<Watchlist[]> => {
	const userId = getCurrentUserId();
	return TEU.tryCatch(() => WatchlistModel.find({ userId }).exec());
};

