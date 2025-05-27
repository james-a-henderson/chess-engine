import { GameEngine } from '../engine';
import { standardChessConfig, testConfig } from '../rulesConfiguration';
import { assertBoardPosition } from '../testHelpers';
import { BoardPosition, GameRules, IllegalMoveError } from '../types';

type gameMove = [BoardPosition, BoardPosition]; //starting square, destination square

describe('integration tests', () => {
    //the goal with this test suite is to simulate chess games, and verify that the final board state is what we expect

    describe('Rook only configuration', () => {
        test.each([
            {
                rulesConfig: testConfig,
                moves: [
                    [
                        ['a', 1],
                        ['a', 8]
                    ],
                    [
                        ['h', 8],
                        ['h', 5]
                    ],
                    [
                        ['h', 1],
                        ['h', 5]
                    ]
                ] as gameMove[],
                expectedBoard: [
                    ['♖', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
                    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
                    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
                    [' ', ' ', ' ', ' ', ' ', ' ', ' ', '♖'],
                    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
                    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
                    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
                    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ']
                ]
            }
        ])(
            'Rook only general test %#',
            <PieceNames extends string[]>({
                rulesConfig,
                moves,
                expectedBoard
            }: {
                rulesConfig: GameRules<PieceNames>;
                moves: gameMove[];
                expectedBoard: (string | undefined)[][];
            }) => {
                runGeneralTest(rulesConfig, moves, expectedBoard);
            }
        );

        test.each([
            {
                rulesConfig: testConfig,
                moves: [
                    [
                        ['a', 1],
                        ['a', 8]
                    ],
                    [
                        ['a', 8],
                        ['a', 5]
                    ]
                ] as gameMove[]
            }
        ])(
            'Rook only error test %#',
            <PieceNames extends string[]>({
                rulesConfig,
                moves
            }: {
                rulesConfig: GameRules<PieceNames>;
                moves: gameMove[];
            }) => {
                runErrorTest(rulesConfig, moves);
            }
        );
    });

    describe('standard chess rules', () => {
        test.each([
            {
                rulesConfig: standardChessConfig,
                moves: [],
                expectedBoard: [
                    ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
                    ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
                    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
                    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
                    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
                    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
                    ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
                    ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖']
                ]
            },
            {
                rulesConfig: standardChessConfig,
                moves: [
                    [
                        ['e', 2],
                        ['e', 3]
                    ],
                    [
                        ['e', 7],
                        ['e', 6]
                    ],
                    [
                        ['d', 1],
                        ['g', 4]
                    ],
                    [
                        ['a', 7],
                        ['a', 6]
                    ],
                    [
                        ['f', 1],
                        ['b', 5]
                    ],
                    [
                        ['a', 6],
                        ['b', 5]
                    ],
                    [
                        ['e', 1],
                        ['f', 1]
                    ],
                    [
                        ['a', 8],
                        ['a', 2]
                    ],
                    [
                        ['a', 1],
                        ['a', 2]
                    ]
                ] as gameMove[],
                expectedBoard: [
                    [' ', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
                    [' ', '♟', '♟', '♟', ' ', '♟', '♟', '♟'],
                    [' ', ' ', ' ', ' ', '♟', ' ', ' ', ' '],
                    [' ', '♟', ' ', ' ', ' ', ' ', ' ', ' '],
                    [' ', ' ', ' ', ' ', ' ', ' ', '♕', ' '],
                    [' ', ' ', ' ', ' ', '♙', ' ', ' ', ' '],
                    ['♖', '♙', '♙', '♙', ' ', '♙', '♙', '♙'],
                    [' ', '♘', '♗', ' ', ' ', '♔', '♘', '♖']
                ]
            },
            {
                rulesConfig: standardChessConfig,
                moves: [
                    [
                        ['b', 1],
                        ['c', 3]
                    ],
                    [
                        ['g', 8],
                        ['h', 6]
                    ],
                    [
                        ['e', 2],
                        ['e', 3]
                    ],
                    [
                        ['h', 6],
                        ['f', 5]
                    ],
                    [
                        ['g', 1],
                        ['e', 2]
                    ],
                    [
                        ['f', 5],
                        ['g', 3]
                    ],
                    [
                        ['e', 2],
                        ['g', 3]
                    ],
                    [
                        ['b', 8],
                        ['c', 6]
                    ]
                ] as gameMove[],
                expectedBoard: [
                    ['♜', ' ', '♝', '♛', '♚', '♝', ' ', '♜'],
                    ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
                    [' ', ' ', '♞', ' ', ' ', ' ', ' ', ' '],
                    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
                    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
                    [' ', ' ', '♘', ' ', '♙', ' ', '♘', ' '],
                    ['♙', '♙', '♙', '♙', ' ', '♙', '♙', '♙'],
                    ['♖', ' ', '♗', '♕', '♔', '♗', ' ', '♖']
                ]
            },
            {
                rulesConfig: standardChessConfig,
                moves: [
                    [
                        ['e', 2],
                        ['e', 4]
                    ],
                    [
                        ['e', 7],
                        ['e', 5]
                    ],
                    [
                        ['g', 1],
                        ['f', 3]
                    ],
                    [
                        ['b', 8],
                        ['c', 6]
                    ],
                    [
                        ['f', 1],
                        ['c', 4]
                    ],
                    [
                        ['f', 8],
                        ['c', 5]
                    ],
                    [
                        ['b', 2],
                        ['b', 4]
                    ]
                ] as gameMove[],
                expectedBoard: [
                    ['♜', ' ', '♝', '♛', '♚', ' ', '♞', '♜'],
                    ['♟', '♟', '♟', '♟', ' ', '♟', '♟', '♟'],
                    [' ', ' ', '♞', ' ', ' ', ' ', ' ', ' '],
                    [' ', ' ', '♝', ' ', '♟', ' ', ' ', ' '],
                    [' ', '♙', '♗', ' ', '♙', ' ', ' ', ' '],
                    [' ', ' ', ' ', ' ', ' ', '♘', ' ', ' '],
                    ['♙', ' ', '♙', '♙', ' ', '♙', '♙', '♙'],
                    ['♖', '♘', '♗', '♕', '♔', ' ', ' ', '♖']
                ]
            }
        ])(
            'Standard rules general test %#',
            <PieceNames extends string[]>({
                rulesConfig,
                moves,
                expectedBoard
            }: {
                rulesConfig: GameRules<PieceNames>;
                moves: gameMove[];
                expectedBoard: (string | undefined)[][];
            }) => {
                runGeneralTest(rulesConfig, moves, expectedBoard);
            }
        );

        test.each([
            {
                rulesConfig: standardChessConfig,
                moves: [
                    [
                        ['a', 2],
                        ['a', 3]
                    ],
                    [
                        ['c', 7],
                        ['c', 6]
                    ],
                    [
                        ['a', 3],
                        ['a', 5]
                    ]
                ] as gameMove[]
            }
        ])(
            'Standard rules error test %#',
            <PieceNames extends string[]>({
                rulesConfig,
                moves
            }: {
                rulesConfig: GameRules<PieceNames>;
                moves: gameMove[];
            }) => {
                runErrorTest(rulesConfig, moves);
            }
        );
    });
});

function runGeneralTest<PieceNames extends string[]>(
    rulesConfig: GameRules<PieceNames>,
    moves: gameMove[],
    expectedBoard: (string | undefined)[][]
) {
    const engine = new GameEngine(rulesConfig);

    moves.forEach(
        ([targetPosition, destinationPosition]: gameMove, index: number) => {
            try {
                engine.makeMove(targetPosition, destinationPosition);
            } catch (error) {
                throw new Error(`Error at move ${index}`);
            }
        }
    );

    assertBoardPosition(engine, expectedBoard);
}

function runErrorTest<PieceNames extends string[]>(
    rulesConfig: GameRules<PieceNames>,
    moves: gameMove[]
) {
    const engine = new GameEngine(rulesConfig);

    for (let i = 0; i < moves.length - 1; i++) {
        //execute all but final move
        const [targetPosition, destinationPosition] = moves[i];
        engine.makeMove(targetPosition, destinationPosition);
    }

    const [finalTarget, finalDestination] = moves[moves.length - 1];

    expect(() => {
        engine.makeMove(finalTarget, finalDestination);
    }).toThrow(IllegalMoveError);
}
