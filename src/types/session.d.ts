import 'express-session';

declare module 'express-session' {
	interface SessionData {
		state: number;
		stateExpiration: Date;
		origin: string;
	}
}
