import {
    LegalMovesForPiece,
    RectangularBoardConfig,
    RulesConfigurationError
} from '../../../../types';
import { PiecePlacement } from '../../../gameState';
import { generateGameState } from '../../../gameState/generateGameState';
import { generateSpacesNotThreatenedFunction } from './spacesNotThreatened';

type pieceNames = ['foo', 'bar'];

describe('spacesNotThreatened', () => {
    const boardConfig: RectangularBoardConfig = { width: 8, height: 8 };

    test('throws error if configuration not set for color', () => {
        const func = generateSpacesNotThreatenedFunction<pieceNames>({
            black: [['h', 8]]
        });

        const state = generateGameState<pieceNames>([], 'white', boardConfig);

        expect(() =>
            func(state, {
                piecePosition: ['b', 2],
                getLegalMovesFunctions: new Map()
            })
        ).toThrow(RulesConfigurationError);
    });

    test('returns true if no getLegalMovesFunctions are passed in', () => {
        const func = generateSpacesNotThreatenedFunction<pieceNames>({
            white: [['a', 1]]
        });

        const piecePlacements: PiecePlacement<pieceNames>[] = [
            {
                piece: { name: 'foo', color: 'white', moveCount: 0 },
                position: ['b', 2]
            },
            {
                piece: { name: 'foo', color: 'black', moveCount: 0 },
                position: ['h', 1]
            },
            {
                piece: { name: 'bar', color: 'black', moveCount: 0 },
                position: ['g', 1]
            }
        ];

        const state = generateGameState<pieceNames>(
            piecePlacements,
            'white',
            boardConfig
        );

        const result = func(state, {
            piecePosition: ['b', 2],
            getLegalMovesFunctions: new Map()
        });
        expect(result).toEqual(true);
    });

    test('returns true if there are no opponent pieces', () => {
        const getLegalMovesFunctions: LegalMovesForPiece<pieceNames> = new Map([
            [
                'foo',
                [
                    () => {
                        return {
                            moves: [['h', 2]],
                            captureMoves: [],
                            spacesThreatened: [['h', 2]]
                        };
                    }
                ]
            ],
            [
                'bar',
                [
                    () => {
                        return {
                            moves: [['g', 2]],
                            captureMoves: [],
                            spacesThreatened: [['g', 2]]
                        };
                    }
                ]
            ]
        ]);

        const func = generateSpacesNotThreatenedFunction<pieceNames>({
            black: [['a', 1]]
        });

        const piecePlacements: PiecePlacement<pieceNames>[] = [
            {
                piece: { name: 'bar', color: 'black', moveCount: 0 },
                position: ['g', 1]
            }
        ];

        const state = generateGameState(piecePlacements, 'black', boardConfig);
        const result = func(state, {
            piecePosition: ['b', 2],
            getLegalMovesFunctions: getLegalMovesFunctions
        });
        expect(result).toEqual(true);
    });

    test('returns true if getLegalMovesFunctions do not threaten space', () => {
        const getLegalMovesFunctions: LegalMovesForPiece<pieceNames> = new Map([
            [
                'foo',
                [
                    () => {
                        return {
                            moves: [['h', 2]],
                            captureMoves: [],
                            spacesThreatened: [['h', 2]]
                        };
                    }
                ]
            ],
            [
                'bar',
                [
                    () => {
                        return {
                            moves: [['g', 2]],
                            captureMoves: [],
                            spacesThreatened: [['g', 2]]
                        };
                    }
                ]
            ]
        ]);

        const func = generateSpacesNotThreatenedFunction<pieceNames>({
            white: [['a', 1]]
        });

        const piecePlacements: PiecePlacement<pieceNames>[] = [
            {
                piece: { name: 'foo', color: 'white', moveCount: 0 },
                position: ['b', 2]
            },
            {
                piece: { name: 'foo', color: 'black', moveCount: 0 },
                position: ['h', 1]
            },
            {
                piece: { name: 'bar', color: 'black', moveCount: 0 },
                position: ['g', 1]
            }
        ];

        const state = generateGameState(piecePlacements, 'white', boardConfig);

        const result = func(state, {
            piecePosition: ['b', 2],
            getLegalMovesFunctions: getLegalMovesFunctions
        });
        expect(result).toEqual(true);
    });

    test('Returns false if one getLegalMovesFunctions threatens space', () => {
        const getLegalMovesFunctions: LegalMovesForPiece<pieceNames> = new Map([
            [
                'foo',
                [
                    () => {
                        return {
                            moves: [['h', 2]],
                            captureMoves: [],
                            spacesThreatened: [['h', 2]]
                        };
                    }
                ]
            ],
            [
                'bar',
                [
                    () => {
                        return {
                            moves: [['g', 2]],
                            captureMoves: [],
                            spacesThreatened: [
                                ['g', 2],
                                ['a', 1]
                            ]
                        };
                    }
                ]
            ]
        ]);

        const func = generateSpacesNotThreatenedFunction<pieceNames>({
            black: [['a', 1]]
        });

        const piecePlacements: PiecePlacement<pieceNames>[] = [
            {
                piece: { name: 'foo', color: 'black', moveCount: 0 },
                position: ['b', 2]
            },
            {
                piece: { name: 'foo', color: 'white', moveCount: 0 },
                position: ['h', 1]
            },
            {
                piece: { name: 'bar', color: 'white', moveCount: 0 },
                position: ['g', 1]
            }
        ];

        const state = generateGameState(piecePlacements, 'black', boardConfig);

        const result = func(state, {
            piecePosition: ['b', 2],
            getLegalMovesFunctions: getLegalMovesFunctions
        });
        expect(result).toEqual(false);
    });
});
