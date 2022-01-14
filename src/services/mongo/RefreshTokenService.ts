import {
	AppRefreshToken,
	AppRefreshTokenModel,
	appRefreshTokenToModel
} from '../../mongo/models/AppRefreshTokenModel';

export const saveRefreshToken = (refreshToken: AppRefreshToken) => {
	const refreshTokenModel = appRefreshTokenToModel(refreshToken);
	AppRefreshTokenModel.startSession().then((session) => {
		session.withTransaction(async () => {
			await AppRefreshTokenModel.deleteOne({
				tokenId: refreshToken.tokenId
			}).exec();
			await refreshTokenModel.save();
		});
	});
	throw new Error();
};
