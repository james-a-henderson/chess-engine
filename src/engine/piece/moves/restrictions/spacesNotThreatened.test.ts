import {
    PieceConfig,
    PiecePlacement,
    RectangularBoardConfig,
    RulesConfigurationError
} from '../../../../types';
import { RectangularBoard } from '../../../board';
import { Piece } from '../../piece';
import { generateSpacesNotThreatenedFunction } from './spacesNotThreatened';

type testPieceNames = ['foo'];

describe('genearteSpacesNotThreatenedFunction', () => {
    const pieceConfig: PieceConfig<testPieceNames> = {
        name: 'foo',
        notation: 'F',
        displayCharacters: {
            white: 'F',
            black: 'f'
        },
        moves: [],
        startingPositions: {}
    };

    const boardConfig: RectangularBoardConfig = {
        height: 3,
        width: 3
    };

    test('returns true if attacking player has no pieces', () => {
        const piece = new Piece(pieceConfig, 'white', boardConfig);

        const piecePlacements: PiecePlacement<testPieceNames>[] = [
            {
                piece: piece,
                position: ['a', 1]
            }
        ];

        const board = new RectangularBoard(boardConfig, piecePlacements);
        const func = generateSpacesNotThreatenedFunction<testPieceNames>({
            white: [
                ['a', 2],
                ['a', 3]
            ],
            black: [
                ['c', 2],
                ['c', 3]
            ]
        });
        const result = func(piece, board, ['a', 1]);

        expect(result).toEqual(true);
    });

    test('returns true of attacking player has pieces that are not attacking threatened spaces', () => {
        const piece = new Piece(pieceConfig, 'black', boardConfig);

        const piecePlacements: PiecePlacement<testPieceNames>[] = [
            {
                piece: piece,
                position: ['c', 1]
            },
            {
                piece: {
                    playerColor: 'white',
                    pieceName: 'foo',
                    getLegalMoves: () => {
                        return {
                            captureMoves: [],
                            moves: [],
                            spacesThreatened: [
                                ['a', 2],
                                ['b', 1]
                            ]
                        };
                    }
                } as unknown as Piece<testPieceNames>,
                position: ['a', 1]
            }
        ];

        const board = new RectangularBoard(boardConfig, piecePlacements);
        const func = generateSpacesNotThreatenedFunction<testPieceNames>({
            white: [
                ['a', 2],
                ['a', 3]
            ],
            black: [
                ['c', 2],
                ['c', 3]
            ]
        });
        const result = func(piece, board, ['c', 1]);

        expect(result).toEqual(true);
    });

    test('returns false if attacking player is threataning one space', () => {
        const piece = new Piece(pieceConfig, 'white', boardConfig);

        const piecePlacements: PiecePlacement<testPieceNames>[] = [
            {
                piece: piece,
                position: ['a', 1]
            },
            {
                piece: {
                    playerColor: 'black',
                    pieceName: 'foo',
                    getLegalMoves: () => {
                        return {
                            captureMoves: [],
                            moves: [],
                            spacesThreatened: [
                                ['a', 2],
                                ['b', 1]
                            ]
                        };
                    }
                } as unknown as Piece<testPieceNames>,
                position: ['c', 1]
            }
        ];

        const board = new RectangularBoard(boardConfig, piecePlacements);
        const func = generateSpacesNotThreatenedFunction<testPieceNames>({
            white: [
                ['a', 2],
                ['a', 3]
            ],
            black: [
                ['c', 2],
                ['c', 3]
            ]
        });
        const result = func(piece, board, ['a', 1]);

        expect(result).toEqual(false);
    });

    test('throws error if threatened spaces are not specified for player color', () => {
        const piece = new Piece(pieceConfig, 'black', boardConfig);

        const piecePlacements: PiecePlacement<testPieceNames>[] = [
            {
                piece: piece,
                position: ['c', 1]
            }
        ];

        const board = new RectangularBoard(boardConfig, piecePlacements);
        const func = generateSpacesNotThreatenedFunction<testPieceNames>({
            white: [
                ['a', 2],
                ['a', 3]
            ]
        });

        expect(() => {
            func(piece, board, ['c', 1]);
        }).toThrow(RulesConfigurationError);
    });
});
