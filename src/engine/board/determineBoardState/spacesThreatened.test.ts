import { PiecePlacement, RectangularBoardConfig } from '../../../types';
import { Piece } from '../../piece';
import { RectangularBoard } from '../rectangularBoard';
import { areSpacesThreatened } from './spacesThreatened';

type testPieceNames = ['foo'];

describe('areSpacesThreatened', () => {
    const testBoardConfig: RectangularBoardConfig = {
        width: 3,
        height: 3
    };
    test('returns false if attacking player has no pieces', () => {
        const piecePlacements: PiecePlacement<testPieceNames>[] = [
            {
                piece: {
                    playerColor: 'white',
                    pieceName: 'foo',
                    getLegalMoves: () => {
                        return {
                            captureMoves: [],
                            moves: [],
                            spacesThreatened: []
                        };
                    }
                } as unknown as Piece<testPieceNames>,
                position: ['a', 1]
            },
            {
                piece: {
                    playerColor: 'white',
                    pieceName: 'foo',
                    getLegalMoves: () => {
                        return {
                            captureMoves: [],
                            moves: [],
                            spacesThreatened: []
                        };
                    }
                } as unknown as Piece<testPieceNames>,
                position: ['a', 2]
            }
        ];

        const board = new RectangularBoard(testBoardConfig, piecePlacements);
        const result = areSpacesThreatened([['a', 3]], board, 'white');

        expect(result).toEqual(false);
    });

    test('returns true if input is single space that attacking player threatens', () => {
        const piecePlacements: PiecePlacement<testPieceNames>[] = [
            {
                piece: {
                    playerColor: 'black',
                    pieceName: 'foo',
                    getLegalMoves: () => {
                        return {
                            moves: [],
                            captureMoves: [],
                            spacesThreatened: [['a', 1]]
                        };
                    }
                } as unknown as Piece<testPieceNames>,
                position: ['c', 1]
            }
        ];

        const board = new RectangularBoard(testBoardConfig, piecePlacements);
        const result = areSpacesThreatened([['a', 1]], board, 'white');

        expect(result).toEqual(true);
    });

    test('returns false if attacking player threatens non-input spaces', () => {
        const piecePlacements: PiecePlacement<testPieceNames>[] = [
            {
                piece: {
                    playerColor: 'white',
                    pieceName: 'foo',
                    getLegalMoves: () => {
                        return {
                            moves: [],
                            captureMoves: [],
                            spacesThreatened: [['a', 1]]
                        };
                    }
                } as unknown as Piece<testPieceNames>,
                position: ['c', 1]
            },
            {
                piece: {
                    playerColor: 'white',
                    pieceName: 'foo',
                    getLegalMoves: () => {
                        return {
                            moves: [],
                            captureMoves: [],
                            spacesThreatened: [
                                ['a', 2],
                                ['b', 2]
                            ]
                        };
                    }
                } as unknown as Piece<testPieceNames>,
                position: ['c', 2]
            },
            {
                piece: {
                    playerColor: 'white',
                    pieceName: 'foo',
                    getLegalMoves: () => {
                        return {
                            moves: [],
                            captureMoves: [],
                            spacesThreatened: [['b', 3]]
                        };
                    }
                } as unknown as Piece<testPieceNames>,
                position: ['c', 3]
            }
        ];

        const board = new RectangularBoard(testBoardConfig, piecePlacements);
        const result = areSpacesThreatened(
            [
                ['a', 3],
                ['b', 1]
            ],
            board,
            'black'
        );

        expect(result).toEqual(false);
    });

    test('returns true if only one input space is threatened', () => {
        const piecePlacements: PiecePlacement<testPieceNames>[] = [
            {
                piece: {
                    playerColor: 'white',
                    pieceName: 'foo',
                    getLegalMoves: () => {
                        return {
                            moves: [],
                            captureMoves: [],
                            spacesThreatened: [['a', 1]]
                        };
                    }
                } as unknown as Piece<testPieceNames>,
                position: ['c', 1]
            }
        ];

        const board = new RectangularBoard(testBoardConfig, piecePlacements);
        const result = areSpacesThreatened(
            [
                ['a', 1],
                ['b', 1],
                ['b', 2]
            ],
            board,
            'black'
        );

        expect(result).toEqual(true);
    });
});
