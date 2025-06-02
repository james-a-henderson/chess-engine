import { GameEngine } from './GameEngine';
import { standardChessConfig, testConfig } from '../rulesConfiguration';
import { GameRules, PieceConfig, Player } from '../types/configuration';
import {
    BoardConfigurationError,
    PieceConfigurationError,
    PlayerConfigurationError,
    InvalidSpaceError
} from '../types/errors';
import { assertBoardPosition } from '../testHelpers';

import * as GenerateBoardVerificationFunctions from './board/generateVerifyBoardFunctions';

type testPieceNames = ['testPiece', 'foo', 'bar'];

describe('initialize engine', () => {
    const genericPiece: PieceConfig<testPieceNames> = {
        name: 'testPiece',
        notation: 'A',
        displayCharacters: {
            white: 'A',
            black: 'B'
        },
        moves: [],
        startingPositions: {
            white: [['a', 1]],
            black: [['a', 3]]
        }
    };

    const genericRulesConfig: GameRules<testPieceNames> = {
        name: 'test',
        board: {
            height: 3,
            width: 3
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

    beforeEach(() => {
        jest.restoreAllMocks();
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

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
                    },
                    pieces: []
                };

                const board = new GameEngine(config).board.spaces;
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

        test.each([
            [
                [
                    { color: 'white', order: 0 } as Player,
                    { color: 'black', order: 1 } as Player
                ],
                'white'
            ],
            [
                [
                    { color: 'white', order: 10 } as Player,
                    { color: 'black', order: 1 } as Player
                ],
                'black'
            ],
            [
                [
                    { color: 'white', order: 5 } as Player,
                    { color: 'black', order: 100 } as Player
                ],
                'white'
            ]
        ])(
            'player configuration %o has starting player %s',
            (players: Player[], expected: string) => {
                const config: GameRules<testPieceNames> = {
                    ...genericRulesConfig,
                    players: players
                };

                const engine = new GameEngine(config);
                expect(engine.currentPlayer).toEqual(expected);
            }
        );
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
                        startingPositions: {
                            white: [['b', 1]],
                            black: [['b', 3]]
                        }
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
                        startingPositions: {
                            white: [['b', 1]],
                            black: [['b', 3]]
                        }
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

    describe('piece starting positions', () => {
        test('sets correct positions when configuration is valid', () => {
            const config: GameRules<testPieceNames> = {
                ...genericRulesConfig,
                pieces: [
                    {
                        name: 'foo',
                        notation: 'F',
                        moves: [],
                        displayCharacters: {
                            white: 'f',
                            black: 'F'
                        },
                        startingPositions: {
                            white: [['a', 1]],
                            black: [['a', 3]]
                        }
                    },
                    {
                        name: 'bar',
                        notation: 'B',
                        moves: [],
                        displayCharacters: {
                            white: 'b',
                            black: 'B'
                        },
                        startingPositions: {
                            white: [['c', 1]],
                            black: [['c', 3]]
                        }
                    }
                ]
            };

            const engine = new GameEngine<testPieceNames>(config);

            const expectedBoard: string[][] = [
                ['F', ' ', 'B'],
                [' ', ' ', ' '],
                ['f', ' ', 'b']
            ];

            assertBoardPosition(engine.board, expectedBoard);
        });

        test('throws if multiple pieces are placed on the same space', () => {
            const config: GameRules<testPieceNames> = {
                ...genericRulesConfig,
                pieces: [
                    {
                        ...genericPiece,
                        startingPositions: {
                            white: [['a', 1]],
                            black: [['a', 1]]
                        }
                    }
                ]
            };

            expect(() => new GameEngine(config)).toThrow(
                PieceConfigurationError
            );
        });

        test.each([
            ['d', 1],
            ['c', 0],
            ['2', 2],
            ['aa', 3],
            ['a', 10],
            ['b', 100],
            ['a', -10]
        ])(
            'position %s, %d is outside the board and throws error',
            (file: string, rank: number) => {
                const config: GameRules<testPieceNames> = {
                    ...genericRulesConfig,
                    pieces: [
                        {
                            ...genericPiece,
                            startingPositions: {
                                white: [[file, rank]]
                            }
                        }
                    ]
                };

                expect(() => new GameEngine(config)).toThrow(InvalidSpaceError);
            }
        );
    });

    describe('generateVerifyBoardStateFunctions', () => {
        test('generateCheckFunction called if rules have checkmate win condition', () => {
            const generateCheckFunctionMock = jest.spyOn(
                GenerateBoardVerificationFunctions,
                'generateCheckFunction'
            );

            const config: GameRules<testPieceNames> = {
                ...genericRulesConfig,
                winConditions: [
                    { condition: 'checkmate', checkmatePiece: 'testPiece' }
                ]
            };

            new GameEngine(config);

            expect(generateCheckFunctionMock).toHaveBeenCalledTimes(1);
        });

        test('generateCheckFunction is not called if rules does not have checkmate win condition', () => {
            const generateCheckFunctionMock = jest.spyOn(
                GenerateBoardVerificationFunctions,
                'generateCheckFunction'
            );

            const config: GameRules<testPieceNames> = {
                ...genericRulesConfig,
                winConditions: [{ condition: 'resign' }]
            };

            new GameEngine(config);

            expect(generateCheckFunctionMock).toHaveBeenCalledTimes(0);
        });
    });
});
