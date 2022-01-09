import {
	createFullTestServer,
	FullTestServer,
	stopFullTestServer
} from '../testutils/fullTestServer';
import jwt from 'jsonwebtoken';
import { AccessToken } from '../../src/express/TokenValidation';
import request from 'supertest';
import { createKeyPair } from '../testutils/keyPair';
import { pipe } from 'fp-ts/function';
import * as EU from '../../src/function/EitherUtils';

const accessToken: AccessToken = {
	userId: 1,
	userEmail: 'bob@gmail.com',
	firstName: 'Bob',
	lastName: 'Saget',
	roles: [],
	sub: 'bob@gmail.com',
	clientName: 'the-app'
};

describe('TokenValidation', () => {
	let fullTestServer: FullTestServer;
	beforeAll(async () => {
		fullTestServer = await createFullTestServer();
	});

	afterAll(async () => {
		await stopFullTestServer(fullTestServer);
	});

	it('has valid access token', async () => {
		const token: string = jwt.sign(
			accessToken,
			fullTestServer.keyPair.privateKey,
			{
				algorithm: 'ES256'
			}
		);
		const res = await request(fullTestServer.expressServer.server)
			.get('/portfolios')
			.set('Authorization', `Bearer ${token}`)
			.expect(200);
		expect(res.body).toEqual([]);
	});

	it('access token is expired', async () => {
		const token: string = jwt.sign(
			accessToken,
			fullTestServer.keyPair.privateKey,
			{
				algorithm: 'ES256',
				expiresIn: '-10m'
			}
		);
		const res = await request(fullTestServer.expressServer.server)
			.get('/portfolios')
			.set('Authorization', `Bearer ${token}`)
			.expect(401);
		expect(res.body).toEqual(
			expect.objectContaining({
				status: 401,
				message: 'Unauthorized'
			})
		);
	});

	it('access token has invalid signature', async () => {
		const newKeyPair = pipe(createKeyPair(), EU.throwIfLeft);
		const token: string = jwt.sign(accessToken, newKeyPair.privateKey, {
			algorithm: 'ES256'
		});
		const res = await request(fullTestServer.expressServer.server)
			.get('/portfolios')
			.set('Authorization', `Bearer ${token}`)
			.expect(401);
		expect(res.body).toEqual(
			expect.objectContaining({
				status: 401,
				message: 'Unauthorized'
			})
		);
	});

	it('has no access token', async () => {
		const res = await request(fullTestServer.expressServer.server)
			.get('/portfolios')
			.expect(401);
		expect(res.body).toEqual(
			expect.objectContaining({
				status: 401,
				message: 'Unauthorized'
			})
		);
	});
});
