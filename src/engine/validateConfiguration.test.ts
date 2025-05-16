import { GameEngine } from './GameEngine';
import { standardChessConfig, testConfig } from '../rulesConfiguration';
import { GameRules, PieceConfig, Player } from '../types';
import {
    BoardConfigurationError,
    PieceConfigurationError,
    PlayerConfigurationError
} from '../types/errors/validationErrors';

type testPieceNames = ['testPiece', 'foo', 'bar'];

describe('validateRulesConfiguration', () => {
    const genericPiece: PieceConfig<testPieceNames> = {
        name: 'testPiece',
        notation: 'A',
        displayCharacters: {
            white: 'A',
            black: 'B'
        },
        moves: [],
        startingPositions: [
            {
                playerColor: 'white',
                positions: [['a', 1]]
            },
            {
                playerColor: 'black',
                positions: [['a', 8]]
            }
        ]
    };

    const genericRulesConfig: GameRules<testPieceNames> = {
        name: 'test',
        board: {
            height: 8,
            width: 8
        },
        players: [
            {
                color: 'white',
                order: 0
            },
            {
                color: 'black',
                order: 1
            }
        ],
        winConditions: [
            {
                condition: 'resign'
            }
        ],
        drawConditions: [],
        pieces: [genericPiece]
    };

    test('standard chess rules validate with no errors', () => {
        expect(() => new GameEngine(standardChessConfig)).not.toThrow();
    });

    test('simplified chess rules validate with no errors', () => {
        expect(() => new GameEngine(testConfig)).not.toThrow();
    });

    describe('board configuration', () => {
        test.each([
            [8, 8],
            [1, 1],
            [702, 702],
            [18, 45]
        ])(
            'board with width %d and height %d generates board of correct size',
            (width, height) => {
                const config: GameRules<testPieceNames> = {
                    ...genericRulesConfig,
                    board: {
                        width: width,
                        height: height
                    }
                };

                const board = new GameEngine(config).board;
                expect(board.length).toEqual(width);
                board.forEach((file) => {
                    expect(file.length).toEqual(height);
                });
            }
        );

        test.each([
            [0, 1],
            [1, 0],
            [0, 0],
            [NaN, 10],
            [8, NaN],
            [NaN, NaN],
            [-4, 3],
            [5, -10],
            [-2, -5],
            [2.3, 5],
            [4, 4.3],
            [6.6, 7.7],
            [Infinity, 2],
            [4, Infinity],
            [Number.MAX_SAFE_INTEGER + 1, 5],
            [1024, 1024]
        ])(
            'board with width %d and height %d throws an error',
            (width, height) => {
                const config: GameRules<testPieceNames> = {
                    ...genericRulesConfig,
                    board: {
                        width: width,
                        height: height
                    }
                };

                expect(() => new GameEngine(config)).toThrow(
                    BoardConfigurationError
                );
            }
        );
    });

    describe('player configuration', () => {
        test.each([
            [
                [
                    { color: 'white', order: 0 } as Player,
                    { color: 'black', order: 1 } as Player
                ]
            ],
            [
                [
                    { color: 'black', order: 0 } as Player,
                    { color: 'white', order: 1 } as Player
                ]
            ],
            [
                [
                    {
                        color: 'white',
                        order: Number.MAX_SAFE_INTEGER
                    } as Player,
                    { color: 'black', order: Number.MIN_SAFE_INTEGER } as Player
                ]
            ],
            [
                [
                    { color: 'white', order: 0 } as Player,
                    { color: 'black', order: -5 } as Player
                ]
            ]
        ])(
            'player configuration %o does not throw an error',
            (players: Player[]) => {
                const config: GameRules<testPieceNames> = {
                    ...genericRulesConfig,
                    players: players
                };

                expect(() => new GameEngine(config)).not.toThrow(
                    PlayerConfigurationError
                );
            }
        );

        test.each([
            [
                [
                    { color: 'white', order: 0 } as Player,
                    { color: 'white', order: 1 } as Player
                ]
            ],
            [
                [
                    { color: 'black', order: 0 } as Player,
                    { color: 'black', order: 1 } as Player
                ]
            ],
            [
                [
                    { color: 'white', order: 0 } as Player,
                    { color: 'black', order: 0 } as Player
                ]
            ],
            [
                [
                    { color: 'white', order: 0.4 } as Player,
                    { color: 'black', order: 25 } as Player
                ]
            ],
            [
                [
                    {
                        color: 'white',
                        order: Number.MAX_SAFE_INTEGER + 1
                    } as Player,
                    { color: 'black', order: 1 } as Player
                ]
            ],
            [
                [
                    { color: 'white', order: 0 } as Player,
                    {
                        color: 'black',
                        order: Number.MIN_SAFE_INTEGER - 1
                    } as Player
                ]
            ],
            [[{ color: 'white', order: 0 } as Player]],
            [[]]
        ])('player configuration %o throws an error', (players: Player[]) => {
            const config: GameRules<testPieceNames> = {
                ...genericRulesConfig,
                players: players
            };

            expect(() => new GameEngine(config)).toThrow(
                PlayerConfigurationError
            );
        });
    });

    describe('piece config', () => {
        test('throws if the same piece name is reused', () => {
            const config: GameRules<testPieceNames> = {
                ...genericRulesConfig,
                pieces: [
                    genericPiece,
                    {
                        name: 'testPiece',
                        notation: 'B',
                        displayCharacters: {
                            white: 'C',
                            black: 'D'
                        },
                        moves: [],
                        startingPositions: [
                            {
                                playerColor: 'white',
                                positions: [['b', 1]]
                            },
                            {
                                playerColor: 'black',
                                positions: [['b', 8]]
                            }
                        ]
                    }
                ]
            };
            expect(() => new GameEngine(config)).toThrow(
                PieceConfigurationError
            );
        });

        test('throws if same piece notation is reused', () => {
            const config: GameRules<testPieceNames> = {
                ...genericRulesConfig,
                pieces: [
                    genericPiece,
                    {
                        name: 'foo',
                        notation: 'A',
                        displayCharacters: {
                            white: 'C',
                            black: 'D'
                        },
                        moves: [],
                        startingPositions: [
                            {
                                playerColor: 'white',
                                positions: [['b', 1]]
                            },
                            {
                                playerColor: 'black',
                                positions: [['b', 8]]
                            }
                        ]
                    }
                ]
            };
            expect(() => new GameEngine(config)).toThrow(
                PieceConfigurationError
            );
        });
        test('throws if same display character is reused', () => {
            const config: GameRules<testPieceNames> = {
                ...genericRulesConfig,
                pieces: [
                    {
                        ...genericPiece,
                        displayCharacters: {
                            white: 'A',
                            black: 'A'
                        }
                    }
                ]
            };
            expect(() => new GameEngine(config)).toThrow(
                PieceConfigurationError
            );
        });

        test('throws if there are fewer display characters then number of players', () => {
            const config: GameRules<testPieceNames> = {
                ...genericRulesConfig,
                pieces: [
                    {
                        ...genericPiece,
                        displayCharacters: {
                            white: 'A'
                        }
                    }
                ]
            };
            expect(() => new GameEngine(config)).toThrow(
                PieceConfigurationError
            );
        });

        test('throws if there are no display characters', () => {
            const config: GameRules<testPieceNames> = {
                ...genericRulesConfig,
                pieces: [
                    {
                        ...genericPiece,
                        displayCharacters: {}
                    }
                ]
            };
            expect(() => new GameEngine(config)).toThrow(
                PieceConfigurationError
            );
        });
        test('throws if display character does not belong to registered player', () => {
            const config: GameRules<testPieceNames> = {
                ...genericRulesConfig,
                pieces: [
                    {
                        ...genericPiece,
                        displayCharacters: {
                            white: 'A',
                            // @ts-expect-error there are currently only two player colors defined
                            green: 'B'
                        }
                    }
                ]
            };
            expect(() => new GameEngine(config)).toThrow(
                PlayerConfigurationError
            );
        });
    });
});
