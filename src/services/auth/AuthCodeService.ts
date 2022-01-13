import { Request } from 'express';

export const prepareAuthCodeLogin = (req: Request): string => {
	req.header('Origin');
	throw new Error();
};
