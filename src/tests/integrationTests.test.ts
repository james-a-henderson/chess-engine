/* eslint-disable  @typescript-eslint/no-unused-vars */ //disabling this becuase it throws for testName, which isn't used directly in code

import { GameEngine } from '../engine';
import { standardChessConfig, testConfig } from '../rulesConfiguration';
import { assertBoardPosition } from '../testHelpers';
import {
    BoardPosition,
    GameRules,
    IllegalMoveError,
    MoveOptions
} from '../types';

type gameMove<PieceNames extends string[]> = [
    BoardPosition,
    BoardPosition,
    MoveOptions<PieceNames>?
]; //starting square, destination square

describe('integration tests', () => {
    //the goal with this test suite is to simulate chess games, and verify that the final board state is what we expect

    describe('Rook only configuration', () => {
        test.each([
            {
                testName: 'Rook test 1',
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
                ] as gameMove<['rook']>[],
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
            'Rook only general test: $testName',
            ({
                testName,
                moves,
                expectedBoard
            }: {
                testName: string;
                moves: gameMove<['rook']>[];
                expectedBoard: (string | undefined)[][];
            }) => {
                runGeneralTest(testConfig, moves, expectedBoard);
            }
        );

        test.each([
            {
                testName: 'Moving captured piece throws error',
                moves: [
                    [
                        ['a', 1],
                        ['a', 8]
                    ],
                    [
                        ['a', 8],
                        ['a', 5]
                    ]
                ] as gameMove<['rook']>[]
            }
        ])(
            'Rook only error test: $testName',
            ({
                testName,
                moves
            }: {
                testName: string;
                moves: gameMove<['rook']>[];
            }) => {
                runErrorTest(testConfig, moves);
            }
        );
    });

    describe('standard chess rules', () => {
        type gameMoveStandard = gameMove<
            ['pawn', 'king', 'queen', 'rook', 'bishop', 'knight']
        >;
        test.each([
            {
                testName: 'starting board matches expected',
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
                testName: 'standard move test',
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
                ] as gameMoveStandard[],
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
                testName: 'knight moves',
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
                ] as gameMoveStandard[],
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
                testName: "Evan's gambit",
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
                ] as gameMoveStandard[],
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
            },
            {
                testName: 'kingside castle',
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
                        ['f', 8],
                        ['c', 5]
                    ],
                    [
                        ['f', 1],
                        ['e', 2]
                    ],
                    [
                        ['g', 8],
                        ['h', 6]
                    ],
                    [['e', 1], ['g', 1], { type: 'castle' }],
                    [['e', 8], ['g', 8], { type: 'castle' }]
                ] as gameMoveStandard[],
                expectedBoard: [
                    ['♜', '♞', '♝', '♛', ' ', '♜', '♚', ' '],
                    ['♟', '♟', '♟', '♟', ' ', '♟', '♟', '♟'],
                    [' ', ' ', ' ', ' ', ' ', ' ', ' ', '♞'],
                    [' ', ' ', '♝', ' ', '♟', ' ', ' ', ' '],
                    [' ', ' ', ' ', ' ', '♙', ' ', ' ', ' '],
                    [' ', ' ', ' ', ' ', ' ', '♘', ' ', ' '],
                    ['♙', '♙', '♙', '♙', '♗', '♙', '♙', '♙'],
                    ['♖', '♘', '♗', '♕', ' ', '♖', '♔', ' ']
                ]
            },
            {
                testName: 'Queenside castle',
                moves: [
                    [
                        ['d', 2],
                        ['d', 4]
                    ],
                    [
                        ['d', 7],
                        ['d', 5]
                    ],
                    [
                        ['c', 1],
                        ['f', 4]
                    ],
                    [
                        ['d', 8],
                        ['d', 6]
                    ],
                    [
                        ['b', 1],
                        ['c', 3]
                    ],
                    [
                        ['c', 8],
                        ['e', 6]
                    ],
                    [
                        ['d', 1],
                        ['d', 2]
                    ],
                    [
                        ['b', 8],
                        ['a', 6]
                    ],
                    [['e', 1], ['c', 1], { type: 'castle' }],
                    [['e', 8], ['c', 8], { type: 'castle' }]
                ] as gameMoveStandard[],
                expectedBoard: [
                    [' ', ' ', '♚', '♜', ' ', '♝', '♞', '♜'],
                    ['♟', '♟', '♟', ' ', '♟', '♟', '♟', '♟'],
                    ['♞', ' ', ' ', '♛', '♝', ' ', ' ', ' '],
                    [' ', ' ', ' ', '♟', ' ', ' ', ' ', ' '],
                    [' ', ' ', ' ', '♙', ' ', '♗', ' ', ' '],
                    [' ', ' ', '♘', ' ', ' ', ' ', ' ', ' '],
                    ['♙', '♙', '♙', '♕', '♙', '♙', '♙', '♙'],
                    [' ', ' ', '♔', '♖', ' ', '♗', '♘', '♖']
                ]
            },
            {
                testName: 'Promotion test',
                moves: [
                    [
                        ['a', 2],
                        ['a', 4]
                    ],
                    [
                        ['c', 7],
                        ['c', 5]
                    ],
                    [
                        ['a', 4],
                        ['a', 5]
                    ],
                    [
                        ['c', 5],
                        ['c', 4]
                    ],
                    [
                        ['a', 5],
                        ['a', 6]
                    ],
                    [
                        ['c', 4],
                        ['c', 3]
                    ],
                    [
                        ['a', 6],
                        ['b', 7]
                    ],
                    [
                        ['c', 3],
                        ['b', 2]
                    ],
                    [
                        ['b', 7],
                        ['a', 8],
                        { type: 'promotion', promotionTarget: 'rook' }
                    ],
                    [
                        ['b', 2],
                        ['a', 1],
                        { type: 'promotion', promotionTarget: 'rook' }
                    ],
                    [
                        ['c', 2],
                        ['c', 4]
                    ],
                    [
                        ['a', 7],
                        ['a', 5]
                    ],
                    [
                        ['c', 4],
                        ['c', 5]
                    ],
                    [
                        ['a', 5],
                        ['a', 4]
                    ],
                    [
                        ['c', 5],
                        ['c', 6]
                    ],
                    [
                        ['a', 4],
                        ['a', 3]
                    ],
                    [
                        ['c', 6],
                        ['c', 7]
                    ],
                    [
                        ['a', 3],
                        ['a', 2]
                    ],
                    [
                        ['c', 7],
                        ['b', 8],
                        { type: 'promotion', promotionTarget: 'bishop' }
                    ],
                    [
                        ['a', 2],
                        ['b', 1],
                        { type: 'promotion', promotionTarget: 'knight' }
                    ],
                    [
                        ['f', 2],
                        ['f', 4]
                    ],
                    [
                        ['h', 7],
                        ['h', 5]
                    ],
                    [
                        ['f', 4],
                        ['f', 5]
                    ],
                    [
                        ['h', 5],
                        ['h', 4]
                    ],
                    [
                        ['f', 5],
                        ['f', 6]
                    ],
                    [
                        ['h', 4],
                        ['h', 3]
                    ],
                    [
                        ['f', 6],
                        ['g', 7]
                    ],
                    [
                        ['h', 3],
                        ['g', 2]
                    ],
                    [
                        ['g', 7],
                        ['h', 8],
                        { type: 'promotion', promotionTarget: 'queen' }
                    ],
                    [
                        ['g', 2],
                        ['h', 1],
                        { type: 'promotion', promotionTarget: 'queen' }
                    ]
                ] as gameMoveStandard[],
                expectedBoard: [
                    ['♖', '♗', '♝', '♛', '♚', '♝', '♞', '♕'],
                    [' ', ' ', ' ', '♟', '♟', '♟', ' ', ' '],
                    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
                    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
                    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
                    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
                    [' ', ' ', ' ', '♙', '♙', ' ', ' ', '♙'],
                    ['♜', '♞', '♗', '♕', '♔', '♗', '♘', '♛']
                ]
            },
            {
                testName: 'En passant test 1',
                moves: [
                    [
                        ['e', 2],
                        ['e', 4]
                    ],
                    [
                        ['d', 7],
                        ['d', 5]
                    ],
                    [
                        ['e', 4],
                        ['e', 5]
                    ],
                    [
                        ['f', 7],
                        ['f', 5]
                    ],
                    [
                        ['e', 5],
                        ['f', 6]
                    ]
                ] as gameMoveStandard[],
                expectedBoard: [
                    ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
                    ['♟', '♟', '♟', ' ', '♟', ' ', '♟', '♟'],
                    [' ', ' ', ' ', ' ', ' ', '♙', ' ', ' '],
                    [' ', ' ', ' ', '♟', ' ', ' ', ' ', ' '],
                    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
                    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
                    ['♙', '♙', '♙', '♙', ' ', '♙', '♙', '♙'],
                    ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖']
                ]
            },
            {
                testName: 'En passant test 2',
                moves: [
                    [
                        ['e', 2],
                        ['e', 4]
                    ],
                    [
                        ['f', 7],
                        ['f', 5]
                    ],
                    [
                        ['e', 4],
                        ['e', 5]
                    ],
                    [
                        ['f', 5],
                        ['f', 4]
                    ],
                    [
                        ['g', 2],
                        ['g', 4]
                    ],
                    [
                        ['f', 4],
                        ['g', 3]
                    ]
                ] as gameMoveStandard[],
                expectedBoard: [
                    ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
                    ['♟', '♟', '♟', '♟', '♟', ' ', '♟', '♟'],
                    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
                    [' ', ' ', ' ', ' ', '♙', ' ', ' ', ' '],
                    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
                    [' ', ' ', ' ', ' ', ' ', ' ', '♟', ' '],
                    ['♙', '♙', '♙', '♙', ' ', '♙', ' ', '♙'],
                    ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖']
                ]
            }
        ])(
            'Standard rules general test: $testName',
            ({
                testName,
                moves,
                expectedBoard
            }: {
                testName: string;
                moves: gameMoveStandard[];
                expectedBoard: (string | undefined)[][];
            }) => {
                runGeneralTest(standardChessConfig, moves, expectedBoard);
            }
        );

        test.each([
            {
                testName: "can only double pawn move on pawn's first move",
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
                ] as gameMoveStandard[]
            },
            {
                testName: 'Cannot move king into check',
                moves: [
                    [
                        ['f', 2],
                        ['f', 3]
                    ],
                    [
                        ['c', 7],
                        ['c', 6]
                    ],
                    [
                        ['b', 1],
                        ['a', 3]
                    ],
                    [
                        ['d', 8],
                        ['b', 6]
                    ],
                    [
                        ['e', 1],
                        ['f', 2]
                    ]
                ] as gameMoveStandard[]
            },
            {
                testName: 'Cannot move pinned piece',
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
                        ['d', 2],
                        ['d', 4]
                    ],
                    [
                        ['d', 7],
                        ['d', 5]
                    ],
                    [
                        ['e', 4],
                        ['d', 5]
                    ],
                    [
                        ['e', 5],
                        ['d', 4]
                    ],
                    [
                        ['d', 1],
                        ['e', 2]
                    ],
                    [
                        ['f', 8],
                        ['e', 7]
                    ],
                    [
                        ['c', 2],
                        ['c', 3]
                    ],
                    [
                        ['e', 7],
                        ['f', 8]
                    ]
                ] as gameMoveStandard[]
            },
            {
                testName: 'must move out of check',
                moves: [
                    [
                        ['f', 2],
                        ['f', 4]
                    ],
                    [
                        ['e', 7],
                        ['e', 5]
                    ],
                    [
                        ['e', 2],
                        ['e', 3]
                    ],
                    [
                        ['d', 8],
                        ['h', 4]
                    ],
                    [
                        ['d', 1],
                        ['e', 2]
                    ]
                ] as gameMoveStandard[]
            },
            {
                testName: 'cannot castle through own pieces',
                moves: [
                    [
                        ['d', 2],
                        ['d', 3]
                    ],
                    [
                        ['d', 7],
                        ['d', 6]
                    ],
                    [
                        ['c', 1],
                        ['e', 3]
                    ],
                    [
                        ['e', 8],
                        ['d', 7]
                    ],
                    [
                        ['d', 1],
                        ['d', 2]
                    ],
                    [
                        ['d', 7],
                        ['e', 8]
                    ],
                    [['e', 1], ['c', 1], { type: 'castle' }]
                ] as gameMoveStandard[]
            },
            {
                testName: 'cannot castle if king has moved',
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
                        ['g', 8],
                        ['f', 6]
                    ],
                    [
                        ['f', 1],
                        ['e', 2]
                    ],
                    [
                        ['f', 8],
                        ['c', 5]
                    ],
                    [['e', 1], ['g', 1], { type: 'castle' }],
                    [
                        ['e', 8],
                        ['e', 7]
                    ],
                    [
                        ['h', 2],
                        ['h', 3]
                    ],
                    [
                        ['e', 7],
                        ['e', 8]
                    ],
                    [
                        ['d', 1],
                        ['e', 1]
                    ],
                    [['e', 8], ['g', 8], { type: 'castle' }]
                ] as gameMoveStandard[]
            },
            {
                testName: 'Cannot castle through check',
                moves: [
                    [
                        ['e', 2],
                        ['e', 4]
                    ],
                    [
                        ['d', 7],
                        ['d', 6]
                    ],
                    [
                        ['f', 1],
                        ['c', 4]
                    ],
                    [
                        ['c', 8],
                        ['e', 6]
                    ],
                    [
                        ['g', 1],
                        ['f', 3]
                    ],
                    [
                        ['e', 6],
                        ['c', 4]
                    ],
                    [['e', 1], ['g', 1], { type: 'castle' }]
                ] as gameMoveStandard[]
            },
            {
                testName: 'Cannot promote pawn before back rank',
                moves: [
                    [
                        ['e', 2],
                        ['e', 4],
                        { type: 'promotion', promotionTarget: 'queen' }
                    ]
                ] as gameMoveStandard[]
            },
            {
                testName: 'Must specify promotionTarget on promotion move',
                moves: [
                    [
                        ['a', 2],
                        ['a', 4]
                    ],
                    [
                        ['c', 7],
                        ['c', 5]
                    ],
                    [
                        ['a', 4],
                        ['a', 5]
                    ],
                    [
                        ['c', 5],
                        ['c', 4]
                    ],
                    [
                        ['a', 5],
                        ['a', 6]
                    ],
                    [
                        ['c', 4],
                        ['c', 3]
                    ],
                    [
                        ['a', 6],
                        ['b', 7]
                    ],
                    [
                        ['c', 3],
                        ['b', 2]
                    ],
                    [
                        ['b', 7],
                        ['a', 8]
                    ]
                ] as gameMoveStandard[]
            },
            {
                testName: 'promotionTarget must be valid configured piece',
                moves: [
                    [
                        ['a', 2],
                        ['a', 4]
                    ],
                    [
                        ['c', 7],
                        ['c', 5]
                    ],
                    [
                        ['a', 4],
                        ['a', 5]
                    ],
                    [
                        ['c', 5],
                        ['c', 4]
                    ],
                    [
                        ['a', 5],
                        ['a', 6]
                    ],
                    [
                        ['c', 4],
                        ['c', 3]
                    ],
                    [
                        ['a', 6],
                        ['b', 7]
                    ],
                    [
                        ['c', 3],
                        ['b', 2]
                    ],
                    [
                        ['b', 7],
                        ['a', 8],
                        { type: 'promotion', promotionTarget: 'king' }
                    ]
                ] as gameMoveStandard[]
            },
            {
                testName: 'En passant not available after additional move',
                moves: [
                    [
                        ['e', 2],
                        ['e', 4]
                    ],
                    [
                        ['d', 7],
                        ['d', 5]
                    ],
                    [
                        ['e', 4],
                        ['e', 5]
                    ],
                    [
                        ['f', 7],
                        ['f', 5]
                    ],
                    [
                        ['d', 2],
                        ['d', 3]
                    ],
                    [
                        ['d', 5],
                        ['d', 4]
                    ],
                    [
                        ['e', 5],
                        ['f', 6]
                    ]
                ] as gameMoveStandard[]
            }
        ])(
            'Standard rules error test: $testName',
            ({
                testName,
                moves
            }: {
                testName: string;
                moves: gameMoveStandard[];
            }) => {
                runErrorTest(standardChessConfig, moves);
            }
        );
    });
});

function runGeneralTest<PieceNames extends string[]>(
    rulesConfig: GameRules<PieceNames>,
    moves: gameMove<PieceNames>[],
    expectedBoard: (string | undefined)[][]
) {
    const engine = new GameEngine(rulesConfig);

    moves.forEach(
        (
            [
                targetPosition,
                destinationPosition,
                moveOptions
            ]: gameMove<PieceNames>,
            index: number
        ) => {
            try {
                engine.makeMove(
                    targetPosition,
                    destinationPosition,
                    moveOptions
                );
            } catch (error) {
                throw new Error(`Error at move ${index}`);
            }
        }
    );

    assertBoardPosition(engine.board, expectedBoard);
}

function runErrorTest<PieceNames extends string[]>(
    rulesConfig: GameRules<PieceNames>,
    moves: gameMove<PieceNames>[]
) {
    const engine = new GameEngine(rulesConfig);

    for (let i = 0; i < moves.length - 1; i++) {
        //execute all but final move
        const [targetPosition, destinationPosition, moveOptions] = moves[i];
        engine.makeMove(targetPosition, destinationPosition, moveOptions);
    }

    const [finalTarget, finalDestination, finalOptions] =
        moves[moves.length - 1];

    expect(() => {
        engine.makeMove(finalTarget, finalDestination, finalOptions);
    }).toThrow(IllegalMoveError);
}
