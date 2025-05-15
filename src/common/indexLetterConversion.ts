import { MAXIMUM_BOARD_SIZE } from '../types';
import { InvalidSpaceError } from '../types/errors/gameErrors';

export function indexToFileLetter(index: number): string {
    if (index < 0 || index >= MAXIMUM_BOARD_SIZE || !Number.isInteger(index)) {
        throw new InvalidSpaceError(`${index} is invalid`);
    }

    if (index < 26) {
        return String.fromCodePoint(97 + index);
    }

    const firstLetter = String.fromCodePoint(96 + Math.floor(index / 26));
    const secondLetter = String.fromCodePoint(97 + (index % 26));
    return firstLetter + secondLetter;
}

export function fileLetterToIndex(letter: string): number {
    if (
        !/^[a-z]{1,2}$/.test(letter) //only 1 to 3 lowercase a-z
    ) {
        throw new InvalidSpaceError(`Letter ${letter} is not valid`);
    }

    const firstNumber = letter.codePointAt(0)! - 97;

    if (letter.length === 1) {
        return firstNumber;
    }

    const secondNumber = letter.codePointAt(1)! - 97;
    return 26 + firstNumber * 26 + secondNumber;
}
