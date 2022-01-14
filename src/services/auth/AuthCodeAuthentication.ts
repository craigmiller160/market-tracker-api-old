import { Request } from 'express';

export interface AuthCodeSuccess {
    readonly cookie: string;
    readonly postAuthRedirect: string;
}

export const authenticateWithAuthCode = (
	req: Request,
	code: string,
	state: string
) => {};
