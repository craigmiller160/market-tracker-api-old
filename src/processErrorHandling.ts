import { logError } from './logger';

process.on('uncaughtException', (err) => {
	logError('Uncaught Exception', err)();
});
