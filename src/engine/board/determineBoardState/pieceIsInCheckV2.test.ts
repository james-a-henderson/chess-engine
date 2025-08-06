import {
    GameError,
    RectangularBoardConfig,
    VerifyMovesForPiece
} from '../../../types';
import { GameStatePiecePlacement } from '../../gameState';
import { generateGameState } from '../../gameState/generateGameState';
import { pieceIsInCheckV2 } from './pieceIsInCheckV2';

type testPieceNames = ['king', 'attacker'];

describe('pieceIsInCheck', () => {
    const testBoardConfig: RectangularBoardConfig = {
        width: 3,
        height: 3
    };

    test('returns false if verifyFunctions map is empty', () => {
        const piecePlacements: GameStatePiecePlacement<testPieceNames>[] = [
            {
                piece: {
                    color: 'black',
                    name: 'attacker',
                    moveCount: 0
                },
                position: ['c', 3]
            },
            {
                piece: {
                    color: 'black',
                    name: 'attacker',
                    moveCount: 0
                },
                position: ['c', 2]
            },
            {
                piece: {
                    color: 'black',
                    name: 'king',
                    moveCount: 0
                },
                position: ['c', 1]
            },
            {
                piece: {
                    color: 'white',
                    name: 'king',
                    moveCount: 0
                },
                position: ['a', 3]
            }
        ];

        const state = generateGameState(
            piecePlacements,
            'black',
            testBoardConfig
        );
        const result = pieceIsInCheckV2(
            state,
            new Map(),
            new Map(),
            'king',
            'white'
        );
        expect(result).toEqual(false);
    });
    test('returns true if white piece is in check', () => {
        const piecePlacements: GameStatePiecePlacement<testPieceNames>[] = [
            {
                piece: {
                    color: 'black',
                    name: 'attacker',
                    moveCount: 0
                },
                position: ['c', 3]
            },
            {
                piece: {
                    color: 'black',
                    name: 'attacker',
                    moveCount: 0
                },
                position: ['c', 2]
            },
            {
                piece: {
                    color: 'black',
                    name: 'king',
                    moveCount: 0
                },
                position: ['c', 1]
            },
            {
                piece: {
                    color: 'white',
                    name: 'king',
                    moveCount: 0
                },
                position: ['a', 3]
            }
        ];

        const verifyMoves: VerifyMovesForPiece<testPieceNames> = new Map([
            [
                'attacker',
                [
                    () => {
                        return {
                            moveName: 'test',
                            type: 'standard',
                            destinationSpace: ['a', 3],
                            originSpace: ['c', 3],
                            pieceColor: 'black',
                            pieceName: 'attacker'
                        };
                    }
                ]
            ]
        ]);

        const state = generateGameState(
            piecePlacements,
            'black',
            testBoardConfig
        );
        const result = pieceIsInCheckV2(
            state,
            verifyMoves,
            new Map(),
            'king',
            'white'
        );
        expect(result).toEqual(true);
    });

    test('returns false if white piece is not in check', () => {
        const piecePlacements: GameStatePiecePlacement<testPieceNames>[] = [
            {
                piece: {
                    color: 'black',
                    name: 'attacker',
                    moveCount: 0
                },
                position: ['c', 3]
            },
            {
                piece: {
                    color: 'black',
                    name: 'attacker',
                    moveCount: 0
                },
                position: ['c', 2]
            },
            {
                piece: {
                    color: 'black',
                    name: 'king',
                    moveCount: 0
                },
                position: ['c', 1]
            },
            {
                piece: {
                    color: 'white',
                    name: 'king',
                    moveCount: 0
                },
                position: ['a', 3]
            }
        ];

        const verifyMoves: VerifyMovesForPiece<testPieceNames> = new Map([
            [
                'attacker',
                [
                    () => {
                        return false;
                    }
                ]
            ]
        ]);

        const state = generateGameState(
            piecePlacements,
            'black',
            testBoardConfig
        );
        const result = pieceIsInCheckV2(
            state,
            verifyMoves,
            new Map(),
            'king',
            'white'
        );
        expect(result).toEqual(false);
    });

    test('returns true if black piece is in check', () => {
        const piecePlacements: GameStatePiecePlacement<testPieceNames>[] = [
            {
                piece: {
                    color: 'white',
                    name: 'attacker',
                    moveCount: 0
                },
                position: ['c', 3]
            },
            {
                piece: {
                    color: 'white',
                    name: 'attacker',
                    moveCount: 0
                },
                position: ['c', 2]
            },
            {
                piece: {
                    color: 'white',
                    name: 'king',
                    moveCount: 0
                },
                position: ['c', 1]
            },
            {
                piece: {
                    color: 'black',
                    name: 'king',
                    moveCount: 0
                },
                position: ['a', 3]
            }
        ];

        const verifyMoves: VerifyMovesForPiece<testPieceNames> = new Map([
            [
                'attacker',
                [
                    () => {
                        return {
                            moveName: 'test',
                            type: 'standard',
                            destinationSpace: ['a', 3],
                            originSpace: ['c', 3],
                            pieceColor: 'white',
                            pieceName: 'attacker'
                        };
                    }
                ]
            ]
        ]);

        const state = generateGameState(
            piecePlacements,
            'white',
            testBoardConfig
        );
        const result = pieceIsInCheckV2(
            state,
            verifyMoves,
            new Map(),
            'king',
            'black'
        );
        expect(result).toEqual(true);
    });

    test('returns false if white piece is not in check', () => {
        const piecePlacements: GameStatePiecePlacement<testPieceNames>[] = [
            {
                piece: {
                    color: 'white',
                    name: 'attacker',
                    moveCount: 0
                },
                position: ['c', 3]
            },
            {
                piece: {
                    color: 'white',
                    name: 'attacker',
                    moveCount: 0
                },
                position: ['c', 2]
            },
            {
                piece: {
                    color: 'white',
                    name: 'king',
                    moveCount: 0
                },
                position: ['c', 1]
            },
            {
                piece: {
                    color: 'black',
                    name: 'king',
                    moveCount: 0
                },
                position: ['a', 3]
            }
        ];

        const verifyMoves: VerifyMovesForPiece<testPieceNames> = new Map([
            [
                'attacker',
                [
                    () => {
                        return false;
                    }
                ]
            ]
        ]);

        const state = generateGameState(
            piecePlacements,
            'white',
            testBoardConfig
        );
        const result = pieceIsInCheckV2(
            state,
            verifyMoves,
            new Map(),
            'king',
            'white'
        );
        expect(result).toEqual(false);
    });

    test('throws error if no check pieces are found', () => {
        const piecePlacements: GameStatePiecePlacement<testPieceNames>[] = [
            {
                piece: {
                    color: 'white',
                    name: 'attacker',
                    moveCount: 0
                },
                position: ['c', 3]
            },
            {
                piece: {
                    color: 'white',
                    name: 'attacker',
                    moveCount: 0
                },
                position: ['c', 2]
            },
            {
                piece: {
                    color: 'white',
                    name: 'king',
                    moveCount: 0
                },
                position: ['c', 1]
            },
            {
                piece: {
                    color: 'black',
                    name: 'attacker',
                    moveCount: 0
                },
                position: ['a', 3]
            }
        ];

        const state = generateGameState(
            piecePlacements,
            'white',
            testBoardConfig
        );
        expect(() =>
            pieceIsInCheckV2(state, new Map(), new Map(), 'king', 'black')
        ).toThrow(GameError);
    });

    test('throws error if multiple check pieces are found', () => {
        const piecePlacements: GameStatePiecePlacement<testPieceNames>[] = [
            {
                piece: {
                    color: 'white',
                    name: 'attacker',
                    moveCount: 0
                },
                position: ['c', 3]
            },
            {
                piece: {
                    color: 'white',
                    name: 'king',
                    moveCount: 0
                },
                position: ['c', 2]
            },
            {
                piece: {
                    color: 'white',
                    name: 'king',
                    moveCount: 0
                },
                position: ['c', 1]
            },
            {
                piece: {
                    color: 'black',
                    name: 'king',
                    moveCount: 0
                },
                position: ['a', 3]
            }
        ];

        const state = generateGameState(
            piecePlacements,
            'black',
            testBoardConfig
        );
        expect(() =>
            pieceIsInCheckV2(state, new Map(), new Map(), 'king', 'white')
        ).toThrow(GameError);
    });
});
