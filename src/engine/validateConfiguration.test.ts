import { GameEngine } from './GameEngine';
import { standardChessConfig, testConfig } from '../rulesConfiguration';
import { GameRules, PieceConfig, Player } from '../types';
import {
    BoardConfigurationError,
    PieceConfigurationError,
    PlayerConfigurationError
} from './validationErrors';

type testPieceNames = ['testPiece', 'foo', 'bar'];

describe('validateRulesConfiguration', () => {
    const genericPiece: PieceConfig<testPieceNames> = {
        name: 'testPiece',
        notation: 'A',
        displayCharacters: [
            {
                playerColor: 'white',
                displayCharacter: 'A'
            },
            {
                playerColor: 'black',
                displayCharacter: 'B'
            }
        ],
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
            [1024, 1024],
            [18, 45]
        ])(
            'board with width %d and height %d does not throw error',
            (width, height) => {
                const config: GameRules<testPieceNames> = {
                    ...genericRulesConfig,
                    board: {
                        width: width,
                        height: height
                    }
                };

                expect(() => new GameEngine(config)).not.toThrow(
                    BoardConfigurationError
                );
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
            [Number.MAX_SAFE_INTEGER + 1, 5]
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
                        displayCharacters: [
                            {
                                playerColor: 'white',
                                displayCharacter: 'C'
                            },
                            {
                                playerColor: 'black',
                                displayCharacter: 'D'
                            }
                        ],
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
                        displayCharacters: [
                            {
                                playerColor: 'white',
                                displayCharacter: 'C'
                            },
                            {
                                playerColor: 'black',
                                displayCharacter: 'D'
                            }
                        ],
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
                        displayCharacters: [
                            {
                                playerColor: 'white',
                                displayCharacter: 'A'
                            },
                            {
                                playerColor: 'black',
                                displayCharacter: 'A'
                            }
                        ]
                    }
                ]
            };
            expect(() => new GameEngine(config)).toThrow(
                PieceConfigurationError
            );
        });

        test('throws if multiple display characters are used for the same player', () => {
            const config: GameRules<testPieceNames> = {
                ...genericRulesConfig,
                pieces: [
                    {
                        ...genericPiece,
                        displayCharacters: [
                            {
                                playerColor: 'white',
                                displayCharacter: 'A'
                            },
                            {
                                playerColor: 'white',
                                displayCharacter: 'A'
                            }
                        ]
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
                        displayCharacters: [
                            {
                                playerColor: 'white',
                                displayCharacter: 'A'
                            }
                        ]
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
                        displayCharacters: []
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
                        displayCharacters: [
                            {
                                playerColor: 'white',
                                displayCharacter: 'A'
                            },
                            {
                                // @ts-expect-error there are currently only two player colors defined
                                playerColor: 'green',
                                displayCharacter: 'A'
                            }
                        ]
                    }
                ]
            };
            expect(() => new GameEngine(config)).toThrow(
                PlayerConfigurationError
            );
        });
    });
});
