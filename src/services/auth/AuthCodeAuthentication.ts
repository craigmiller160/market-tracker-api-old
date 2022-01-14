import { Request } from 'express';
import { getMarketTrackerSession } from '../../function/HttpRequest';
import * as O from 'fp-ts/Option';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import { compareAsc } from 'date-fns';
import * as IO from 'fp-ts/IO';
import * as IOE from 'fp-ts/IOEither';

// TODO need special exception type to return 401s

// TODO need test for successful login
// TODO need test for login rejected
// TODO need test for invalid state
// TODO need test for expired state

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

const validateStateExpiration = (req: Request): E.Either<Error, Date> => {
	const { stateExpiration } = getMarketTrackerSession(req);
	return pipe(
		O.fromNullable(stateExpiration),
		E.fromOption(
			() => new Error('Cannot find auth code state expiration in session')
		),
		E.filterOrElse(
			(_) => compareAsc(new Date(), _) <= 0,
			() => new Error('Auth code state has expired')
		)
	);
};

const validateOrigin = (req: Request): E.Either<Error, string> => {
	const { origin } = getMarketTrackerSession(req);
	return pipe(
		O.fromNullable(origin),
		E.fromOption(() => new Error('Cannot find origin in session'))
	);
};

const removeAuthCodeSessionAttributes = (req: Request): IO.IO<void> => {
	const session = getMarketTrackerSession(req);
	delete session.stateExpiration;
	delete session.state;
	delete session.origin;
	return IO.of(null);
}

export const authenticateWithAuthCode = (
	req: Request,
	code: string,
	state: number
) => {
	pipe(
		validateState(req, state),
		E.chain(() => validateStateExpiration(req)),
		E.chain(() => validateOrigin(req)),
		E.chainFirst(IOE.fromIO(removeAuthCodeSessionAttributes(req)))
	);
};
