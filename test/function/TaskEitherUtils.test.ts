import { multiTypeSequence } from '../../src/function/TaskEitherUtils';
import * as TE from 'fp-ts/TaskEither';
import '@relmify/jest-fp-ts';

describe('TaskEitherUtils', () => {
	describe('multiTypeSequence', () => {
		it('one argument', async () => {
			const result = await multiTypeSequence(TE.of('A'))();
			expect(result).toEqualRight('A');
		});

		it('two arguments', async () => {
			const result = await multiTypeSequence(TE.of('A'), TE.of('B'))();
			expect(result).toEqualRight(['A', 'B']);
		});
	});
});
