import { RouteCreator } from './RouteCreator';
import { AccessToken, secure } from '../TokenValidation';

export const getUserDetails: RouteCreator = (app) =>
	app.get(
		'/user',
		secure((req, res) => {
			const token = req.user as AccessToken;
			res.send({
				sub: token.sub,
				clientName: token.clientName,
				firstName: token.firstName,
				lastName: token.lastName,
				userId: token.userId,
				userEmail: token.userEmail,
				roles: token.roles
			});
		})
	);