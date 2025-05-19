import { standardChessConfig } from '../rulesConfiguration';
import { GameEngine } from './GameEngine';
import { styleText } from 'node:util';

describe('engine utilities', () => {
    const darkSquare: ('bgGray' | 'black')[] = ['bgGray', 'black'];
    const lightSquare: ('bgWhite' | 'black')[] = ['bgWhite', 'black'];
    const outputs = {
        empty: {
            dark: styleText('bgGray', '   '),
            light: styleText('bgWhite', '   ')
        },
        white: {
            pawn: {
                dark: styleText(darkSquare, ' ♙ '),
                light: styleText(lightSquare, ' ♙ ')
            },
            rook: {
                dark: styleText(darkSquare, ' ♖ '),
                light: styleText(lightSquare, ' ♖ ')
            },
            knight: {
                dark: styleText(darkSquare, ' ♘ '),
                light: styleText(lightSquare, ' ♘ ')
            },
            bishop: {
                dark: styleText(darkSquare, ' ♗ '),
                light: styleText(lightSquare, ' ♗ ')
            },
            queen: {
                dark: styleText(darkSquare, ' ♕ '),
                light: styleText(lightSquare, ' ♕ ')
            },
            king: {
                dark: styleText(darkSquare, ' ♔ '),
                light: styleText(lightSquare, ' ♔ ')
            }
        },
        black: {
            pawn: {
                dark: styleText(darkSquare, ' ♟ '),
                light: styleText(lightSquare, ' ♟ ')
            },
            rook: {
                dark: styleText(darkSquare, ' ♜ '),
                light: styleText(lightSquare, ' ♜ ')
            },
            knight: {
                dark: styleText(darkSquare, ' ♞ '),
                light: styleText(lightSquare, ' ♞ ')
            },
            bishop: {
                dark: styleText(darkSquare, ' ♝ '),
                light: styleText(lightSquare, ' ♝ ')
            },
            queen: {
                dark: styleText(darkSquare, ' ♛ '),
                light: styleText(lightSquare, ' ♛ ')
            },
            king: {
                dark: styleText(darkSquare, ' ♚ '),
                light: styleText(lightSquare, ' ♚ ')
            }
        }
    };
    beforeEach(() => {
        jest.restoreAllMocks();
    });
    test('outputs correct board with standard chess configuration', () => {
        const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
        const engine = new GameEngine(standardChessConfig);
        engine.printBoard();

        expect(spy).toHaveBeenCalledWith(
            outputs.black.rook.light +
                outputs.black.knight.dark +
                outputs.black.bishop.light +
                outputs.black.queen.dark +
                outputs.black.king.light +
                outputs.black.bishop.dark +
                outputs.black.knight.light +
                outputs.black.rook.dark +
                '\n' +
                outputs.black.pawn.dark +
                outputs.black.pawn.light +
                outputs.black.pawn.dark +
                outputs.black.pawn.light +
                outputs.black.pawn.dark +
                outputs.black.pawn.light +
                outputs.black.pawn.dark +
                outputs.black.pawn.light +
                '\n' +
                outputs.empty.light +
                outputs.empty.dark +
                outputs.empty.light +
                outputs.empty.dark +
                outputs.empty.light +
                outputs.empty.dark +
                outputs.empty.light +
                outputs.empty.dark +
                '\n' +
                outputs.empty.dark +
                outputs.empty.light +
                outputs.empty.dark +
                outputs.empty.light +
                outputs.empty.dark +
                outputs.empty.light +
                outputs.empty.dark +
                outputs.empty.light +
                '\n' +
                outputs.empty.light +
                outputs.empty.dark +
                outputs.empty.light +
                outputs.empty.dark +
                outputs.empty.light +
                outputs.empty.dark +
                outputs.empty.light +
                outputs.empty.dark +
                '\n' +
                outputs.empty.dark +
                outputs.empty.light +
                outputs.empty.dark +
                outputs.empty.light +
                outputs.empty.dark +
                outputs.empty.light +
                outputs.empty.dark +
                outputs.empty.light +
                '\n' +
                outputs.white.pawn.light +
                outputs.white.pawn.dark +
                outputs.white.pawn.light +
                outputs.white.pawn.dark +
                outputs.white.pawn.light +
                outputs.white.pawn.dark +
                outputs.white.pawn.light +
                outputs.white.pawn.dark +
                '\n' +
                outputs.white.rook.dark +
                outputs.white.knight.light +
                outputs.white.bishop.dark +
                outputs.white.queen.light +
                outputs.white.king.dark +
                outputs.white.bishop.light +
                outputs.white.knight.dark +
                outputs.white.rook.light +
                '\n'
        );
    });
});
