import { RectangularBoard } from '../engine/board/rectangularBoard';

//takes in an array of board display characters. A space or empty string represents a space with nothing on it
export function assertBoardPosition<T extends string[]>(
    board: RectangularBoard<T>,
    expectedBoard: (string | undefined)[][]
) {
    expectedBoard.reverse(); //reversing the board here allows the input to match what a chess board looks like
    const boardSpaces = board.spaces;

    //note that the indexes for rank and file are reversed on the expectedBoard
    for (let i = 0; i < boardSpaces.length; i++) {
        const file = boardSpaces[i];

        if (expectedBoard.length !== file.length) {
            throw new Error('Board heights do not match');
        }

        for (let j = 0; j < file.length; j++) {
            if (expectedBoard[j].length !== boardSpaces.length) {
                throw new Error('Board widths do not match');
            }

            const testSqare = expectedBoard[j][i];
            const square = file[j];

            switch (testSqare) {
                case '':
                case ' ':
                case undefined:
                case null:
                    if (square.piece !== undefined) {
                        throw new Error(
                            `Square at index ${j}, ${i} should be undefined, but contains ${square.piece.getDisplayCharacter()}`
                        );
                    }
                    break;
                default:
                    if (!square.piece) {
                        throw new Error(
                            `Square at index ${j}, ${i} should have piece ${testSqare}, but is empty`
                        );
                    }
                    if (testSqare !== square.piece.getDisplayCharacter()) {
                        throw new Error(
                            `Square at index ${j}, ${i} should have piece ${testSqare}, but has piece ${square.piece.getDisplayCharacter()} instead`
                        );
                    }
            }
        }
    }
}
