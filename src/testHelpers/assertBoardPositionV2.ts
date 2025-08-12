import { BoardSpaceStatus } from '../engine/gameState';
import { PieceConfig, PlayerColor } from '../types';

export function assertBoardPositionV2<PieceNames extends string[]>(
    board: BoardSpaceStatus<PieceNames>[][],
    expectedBoard: (string | undefined)[][],
    pieceConfig: PieceConfig<PieceNames>[]
) {
    expectedBoard.reverse(); //reversing the board here allows the input to match what a chess board looks like

    //note that file and rank are swapped on the expectedBoard
    for (let i = 0; i < board.length; i++) {
        const file = board[i];

        if (expectedBoard.length !== file.length) {
            throw new Error('Board heights do not match');
        }

        for (let j = 0; j < file.length; j++) {
            if (expectedBoard[j].length !== board.length) {
                throw new Error('Board widths do not match');
            }

            const testSquare = expectedBoard[j][i];
            const square = file[j];

            switch (testSquare) {
                case '':
                case ' ':
                case undefined:
                case null:
                    if (square.piece !== undefined) {
                        throw new Error(
                            `Square at index ${j}, ${i} should be undefined, but contains ${String(square.piece.name)}`
                        );
                    }
                    break;
                default: {
                    if (!square.piece) {
                        throw new Error(
                            `Square at index ${j}, ${i} should have piece ${testSquare}, but is empty`
                        );
                    }
                    const displayChar = findDisplayCharacter(
                        pieceConfig,
                        square.piece.name,
                        square.piece.color
                    );
                    if (testSquare !== displayChar) {
                        throw new Error(
                            `Square at index ${j}, ${i} should have piece ${testSquare}, but has piece ${displayChar} instead`
                        );
                    }
                }
            }
        }
    }
}

function findDisplayCharacter<PieceNames extends string[]>(
    configs: PieceConfig<PieceNames>[],
    pieceName: PieceNames[keyof PieceNames],
    color: PlayerColor
): string {
    for (const config of configs) {
        if (config.name !== pieceName) {
            continue;
        }

        const char = config.displayCharacters[color];

        if (!char) {
            throw new Error(
                `No display character configured for piece ${String(pieceName)}`
            );
        }

        return char;
    }

    throw new Error(`No configuration found for piece ${String(pieceName)}`);
}
