import { addMinutes as baseAddMinutes, format as baseFormat } from 'date-fns';

export const addMinutes =
	(amount: number) =>
	(date: Date): Date =>
		baseAddMinutes(date, amount);

export const format =
	(formatString: string) =>
	(date: Date): string =>
		baseFormat(date, formatString);
