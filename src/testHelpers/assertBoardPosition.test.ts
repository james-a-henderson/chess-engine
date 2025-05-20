//Tests for the tests, what fun!

import { GameEngine } from '../engine';
import { GameRules, PieceConfig } from '../types/configuration';
import { assertBoardPosition } from './assertBoardPosition';

type testPieceNames = ['testPiece', 'foo', 'bar'];
describe('assertBoardPosition', () => {
    const testPiece: PieceConfig<testPieceNames> = {
        name: 'testPiece',
        notation: 'A',
        displayCharacters: {
            white: 'T',
            black: 't'
        },
        moves: [],
        startingPositions: {
            white: [['a', 1]],
            black: [['a', 3]]
        }
    };

    const fooPiece: PieceConfig<testPieceNames> = {
        name: 'foo',
        notation: 'F',
        displayCharacters: {
            white: 'F',
            black: 'f'
        },
        moves: [],
        startingPositions: {
            white: [['c', 1]],
            black: [['c', 3]]
        }
    };

    const barPiece: PieceConfig<testPieceNames> = {
        name: 'bar',
        notation: 'B',
        displayCharacters: {
            white: 'B',
            black: 'b'
        },
        moves: [],
        startingPositions: {
            white: [
                ['b', 1],
                ['b', 2],
                ['b', 3]
            ]
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
        winConditions: [],
        drawConditions: [],
        pieces: []
    };

    test.each([
        {
            expectedBoard: [
                ['', ' ', undefined],
                [' ', '', ' '],
                [undefined, ' ', '']
            ],
            pieces: []
        },
        {
            expectedBoard: [
                ['t', ' ', ' '],
                [' ', ' ', ' '],
                ['T', ' ', ' ']
            ],
            pieces: [testPiece]
        },
        {
            expectedBoard: [
                [' ', ' ', 'f'],
                [' ', ' ', ' '],
                [' ', ' ', 'F']
            ],
            pieces: [fooPiece]
        },
        {
            expectedBoard: [
                [' ', 'B', ' '],
                [' ', 'B', ' '],
                [' ', 'B', ' ']
            ],
            pieces: [barPiece]
        },
        {
            expectedBoard: [
                ['t', ' ', 'f'],
                [' ', ' ', ' '],
                ['T', ' ', 'F']
            ],
            pieces: [testPiece, fooPiece]
        },
        {
            expectedBoard: [
                ['t', 'B', ' '],
                [' ', 'B', ' '],
                ['T', 'B', ' ']
            ],
            pieces: [testPiece, barPiece]
        },
        {
            expectedBoard: [
                [' ', 'B', 'f'],
                [' ', 'B', ' '],
                [' ', 'B', 'F']
            ],
            pieces: [fooPiece, barPiece]
        },
        {
            expectedBoard: [
                ['t', 'B', 'f'],
                [' ', 'B', ' '],
                ['T', 'B', 'F']
            ],
            pieces: [testPiece, fooPiece, barPiece]
        }
    ])(
        'test %# is a valid board',
        ({
            expectedBoard,
            pieces
        }: {
            expectedBoard: (string | undefined)[][];
            pieces: PieceConfig<testPieceNames>[];
        }) => {
            const config = {
                ...genericRulesConfig,
                pieces: pieces
            };
            const engine = new GameEngine(config);
            expect(() =>
                assertBoardPosition(engine, expectedBoard)
            ).not.toThrow();
        }
    );

    test.each([
        {
            expectedBoard: []
        },
        {
            expectedBoard: [[' ', ' ', ' ']]
        },
        {
            expectedBoard: [
                [' ', ' ', ' '],
                [' ', ' ', ' ']
            ]
        },
        {
            expectedBoard: [
                [' ', ' ', ' '],
                [' ', ' ', ' '],
                [' ', ' ', ' '],
                [' ', ' ', ' ']
            ]
        },
        {
            expectedBoard: [
                [' ', ' ', ' '],
                [' ', ' ', ' '],
                [' ', ' ', ' '],
                [' ', ' ', ' '],
                [' ', ' ', ' ']
            ]
        }
    ])(
        'test %# throws board height error',
        ({ expectedBoard }: { expectedBoard: (string | undefined)[][] }) => {
            const engine = new GameEngine(genericRulesConfig);
            expect(() => assertBoardPosition(engine, expectedBoard)).toThrow(
                'Board heights do not match'
            );
        }
    );

    test.each([
        {
            expectedBoard: [
                [' ', ' ', ' ', ' '],
                [' ', ' ', ' ', ' '],
                [' ', ' ', ' ', ' ']
            ]
        },
        {
            expectedBoard: [
                [' ', ' '],
                [' ', ' '],
                [' ', ' ']
            ]
        },
        {
            expectedBoard: [[], [], []]
        },
        {
            expectedBoard: [[' ', ' ', ' '], [' '], [' ', ' ', ' ']]
        },
        {
            expectedBoard: [
                [' ', ' ', ' ', ' '],
                [' ', ' ', ' '],
                [' ', ' ', ' ']
            ]
        }
    ])(
        'test %# throws board width error',
        ({ expectedBoard }: { expectedBoard: (string | undefined)[][] }) => {
            const engine = new GameEngine(genericRulesConfig);
            expect(() => assertBoardPosition(engine, expectedBoard)).toThrow(
                'Board widths do not match'
            );
        }
    );

    test.each([
        {
            expectedBoard: [
                ['t', ' ', ' '],
                [' ', ' ', ' '],
                [' ', ' ', ' ']
            ],
            pieces: []
        },
        {
            expectedBoard: [
                ['t', ' ', ' '],
                [' ', ' ', ' '],
                [' ', ' ', ' ']
            ],
            pieces: [testPiece]
        },
        {
            expectedBoard: [
                ['t', ' ', ' '],
                [' ', ' ', ' '],
                ['T', 'T', ' ']
            ],
            pieces: [testPiece]
        },
        {
            expectedBoard: [
                ['t', ' ', 'F'],
                [' ', ' ', ' '],
                ['T', ' ', 'F']
            ],
            pieces: [testPiece, fooPiece]
        },
        {
            expectedBoard: [
                ['f', ' ', 't'],
                [' ', ' ', ' '],
                ['F', ' ', 'T']
            ],
            pieces: [testPiece, fooPiece]
        },
        {
            expectedBoard: [
                ['T', ' ', 'F'],
                [' ', ' ', ' '],
                ['t', ' ', 'f']
            ],
            pieces: [testPiece, fooPiece]
        }
    ])(
        'test %# throws error',
        ({
            expectedBoard,
            pieces
        }: {
            expectedBoard: (string | undefined)[][];
            pieces: PieceConfig<testPieceNames>[];
        }) => {
            const config = {
                ...genericRulesConfig,
                pieces: pieces
            };
            const engine = new GameEngine(config);
            expect(() => assertBoardPosition(engine, expectedBoard)).toThrow();
        }
    );
});
