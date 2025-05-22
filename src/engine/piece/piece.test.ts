import { PieceConfig } from '../../types';
import { GameEngine } from '../GameEngine';
import { Piece } from './piece';

const generateVerifyLegalMoveFunctionsMock = jest.fn();

jest.mock('./moves', () => {
    return {
        generateVerifyLegalMoveFunctions: () =>
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            generateVerifyLegalMoveFunctionsMock()
    };
});

type testPieceNames = ['foo'];

describe('piece', () => {
    const pieceConfig: PieceConfig<testPieceNames> = {
        name: 'foo',
        notation: 'F',
        displayCharacters: {
            white: 'F',
            black: 'f'
        },
        moves: [
            {
                type: 'standard',
                name: 'testMove',
                captureAvailability: 'optional',
                directions: ['forward'],
                maxSpaces: 'unlimited'
            }
        ],
        startingPositions: {
            white: [['a', 1]],
            black: [['a', 8]]
        }
    };

    const pieceConfigNoMoves: PieceConfig<testPieceNames> = {
        ...pieceConfig,
        moves: []
    };

    const boardConfig = {
        height: 8,
        width: 8
    };

    beforeEach(() => {
        generateVerifyLegalMoveFunctionsMock.mockReset();
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });
    describe('getDisplayCharacter', () => {
        test('returns correct character when player is white', () => {
            const piece = new Piece(
                pieceConfigNoMoves,
                'white',
                ['a', 1],
                boardConfig
            );
            expect(piece.getDisplayCharacter()).toEqual('F');
        });

        test('returns correct character when player is black', () => {
            const piece = new Piece(
                pieceConfigNoMoves,
                'black',
                ['a', 8],
                boardConfig
            );
            expect(piece.getDisplayCharacter()).toEqual('f');
        });
    });

    describe('verifyMove', () => {
        const legalMove = () => {
            return true;
        };
        const illegalMove = () => {
            return false;
        };

        test('returns false with no moves', () => {
            const piece = new Piece(
                pieceConfigNoMoves,
                'white',
                ['a', 1],
                boardConfig
            );
            const result = piece.verifyMove({} as GameEngine<testPieceNames>, [
                'a',
                4
            ]);
            expect(result).toEqual(false);
        });

        test('returns true with one move that returns true', () => {
            generateVerifyLegalMoveFunctionsMock.mockReturnValue([legalMove]);
            const piece = new Piece(
                pieceConfig,
                'white',
                ['a', 1],
                boardConfig
            );
            const result = piece.verifyMove({} as GameEngine<testPieceNames>, [
                'a',
                4
            ]);
            expect(result).toEqual(true);
        });

        test('returns false with one move that returns false', () => {
            generateVerifyLegalMoveFunctionsMock.mockReturnValue([illegalMove]);
            const piece = new Piece(
                pieceConfig,
                'white',
                ['a', 1],
                boardConfig
            );
            const result = piece.verifyMove({} as GameEngine<testPieceNames>, [
                'a',
                4
            ]);
            expect(result).toEqual(false);
        });

        test('returns true if only one move returns true', () => {
            generateVerifyLegalMoveFunctionsMock.mockReturnValue([
                illegalMove,
                illegalMove,
                legalMove
            ]);
            const piece = new Piece(
                pieceConfig,
                'white',
                ['a', 1],
                boardConfig
            );
            const result = piece.verifyMove({} as GameEngine<testPieceNames>, [
                'a',
                4
            ]);
            expect(result).toEqual(true);
        });

        test('returns false if all moves return false', () => {
            generateVerifyLegalMoveFunctionsMock.mockReturnValue([
                illegalMove,
                illegalMove,
                illegalMove
            ]);
            const piece = new Piece(
                pieceConfig,
                'white',
                ['a', 1],
                boardConfig
            );
            const result = piece.verifyMove({} as GameEngine<testPieceNames>, [
                'a',
                4
            ]);
            expect(result).toEqual(false);
        });
    });
});
