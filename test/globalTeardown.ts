import { stopFullTestServer } from './testutils/fullTestServer';
import { fullTestServer } from './globalSetup';

export default async () => {
	console.log('GlobalTeardown');
	await stopFullTestServer(fullTestServer);
};
