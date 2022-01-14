import { Request } from 'express';
import { getMarketTrackerSession } from '../../function/HttpRequest';
import * as O from 'fp-ts/Option';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';

export interface AuthCodeSuccess {
	readonly cookie: string;
	readonly postAuthRedirect: string;
}

const validateState = (
	req: Request,
	providedState: number
): E.Either<Error, number> => {
	const { state } = getMarketTrackerSession(req);
	return pipe(
		O.fromNullable(state),
		E.fromOption(() => new Error('Cannot find auth code state in session')),
		E.filterOrElse(
			(_) => _ === providedState,
			() => new Error('Invalid auth code state')
		)
	);
};

export const authenticateWithAuthCode = (
	req: Request,
	code: string,
	state: number
) => {};
