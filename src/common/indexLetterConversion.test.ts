import { InvalidSpaceError } from '../types/errors/gameErrors';
import { fileLetterToIndex, indexToFileLetter } from './indexLetterConversion';

describe('indexToFileLetter', () => {
    test.each([
        [0, 'a'],
        [10, 'k'],
        [25, 'z'],
        [26, 'aa'],
        [27, 'ab'],
        [51, 'az'],
        [52, 'ba'],
        [54, 'bc'],
        [701, 'zz']
    ])('input: %d expected: %s', (input: number, expected: string) => {
        expect(indexToFileLetter(input)).toBe(expected);
    });

    test.each([
        [-5],
        [1025],
        [NaN],
        [4.3],
        [702],
        [800],
        [Number.MAX_SAFE_INTEGER],
        [Number.MIN_SAFE_INTEGER],
        [Infinity]
    ])('input %d throws error', (input: number) => {
        expect(() => indexToFileLetter(input)).toThrow(InvalidSpaceError);
    });
});

describe('fileLetterToIndex', () => {
    test.each([
        ['a', 0],
        ['k', 10],
        ['z', 25],
        ['aa', 26],
        ['ab', 27],
        ['az', 51],
        ['ba', 52],
        ['bc', 54],
        ['zz', 701]
    ])('input: %s expected: %d', (input: string, expected: number) => {
        expect(fileLetterToIndex(input)).toBe(expected);
    });

    test.each([
        [''],
        ['aaa'],
        ['abd'],
        ['aaaa'],
        ['aml'],
        ['Q'],
        ['42'],
        ['`'],
        ['bC']
    ])('input %s throws error', (input: string) => {
        expect(() => fileLetterToIndex(input)).toThrow(InvalidSpaceError);
    });
});
