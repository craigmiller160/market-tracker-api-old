import {
	createFullTestServer,
	FullTestServer
} from './testutils/fullTestServer';

let fullTestServer: FullTestServer;

export default async () => {
	console.log('GlobalSetup');
	fullTestServer = await createFullTestServer();
};

export { fullTestServer };
