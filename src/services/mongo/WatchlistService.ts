import * as TEU from '../../function/TaskEitherUtils';
import * as A from 'fp-ts/Array';
import * as TE from 'fp-ts/TaskEither';
import {
	Watchlist,
	WatchlistModel,
	WatchlistModelInstanceType,
	watchlistToModel
} from '../../mongo/models/WatchlistModel';
import { pipe } from 'fp-ts/function';

const getCurrentUserId = () => 1;

export const findWatchlistsForUser = (): TEU.TaskEither<Watchlist[]> => {
	const userId = getCurrentUserId();
	return TEU.tryCatch(() => WatchlistModel.find({ userId }).exec());
};

const replaceWatchlistsForUser = (
	userId: number,
	watchlistModels: WatchlistModelInstanceType[]
): TEU.TaskEither<Watchlist[]> =>
	pipe(
		TEU.tryCatch(() => WatchlistModel.deleteMany({ userId }).exec()),
		TE.chain(() =>
			TEU.tryCatch(() => WatchlistModel.insertMany(watchlistModels))
		)
	);

export const saveWatchlistsForUser = (
	watchlists: Watchlist[]
): TEU.TaskEither<void> => {
	const userId = getCurrentUserId();

	const watchlistModels = pipe(
		watchlists,
		A.map((_) =>
			watchlistToModel({
				..._,
				userId
			})
		)
	);

	return pipe(
		TEU.tryCatch(() => WatchlistModel.startSession()),
		TE.chainFirst((session) =>
			TEU.tryCatch(() =>
				session.withTransaction(
					replaceWatchlistsForUser(userId, watchlistModels)
				)
			)
		),
		TE.chain((session) => TEU.tryCatch(() => session.endSession()))
	);
};
