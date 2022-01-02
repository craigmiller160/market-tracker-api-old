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
			const result = await multiTypeSequence(TE.of('A'), TE.of(2))();
			expect(result).toEqualRight(['A', 2]);
		});

		it('three arguments', async () => {
			const result = await multiTypeSequence(
				TE.of('A'),
				TE.of(2),
				TE.of('C')
			)();
			expect(result).toEqualRight(['A', 2, 'C']);
		});
	});
});
