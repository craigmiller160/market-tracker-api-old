import * as core from 'express-serve-static-core';
import { Request, Response } from 'express';

export interface RouteContext {
	readonly req: any;
	readonly res: any;
}

export type ParamsType = core.ParamsDictionary;
export type QueryType = core.Query;

export const route =
	<Params = ParamsType, ReqBody = any, ReqQuery = QueryType>(
		fn: () => void
	) =>
	(
		req: Request<Params, any, ReqBody, ReqQuery, Record<string, any>>,
		res: Response<any, Record<string, any>>
	) => {};
