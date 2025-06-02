import {
    BoardPosition,
    CaptureAvailability,
    Direction,
    GameRules,
    MoveCondition,
    PieceConfig,
    PlayerColor
} from '../../../types';
import { GameEngine } from '../../GameEngine';
import {
    getMoveConditionFunctions,
    makeNextSpaceIterator,
    positionsAreEqual,
    reverseDirection,
    validateCaptureRules
} from './helpers';
import { firstPieceMove } from './restrictions';

type testPieceNames = ['foo', 'bar'];

const rulesConfig: GameRules<testPieceNames> = {
    name: 'test',
    players: [
        { color: 'white', order: 0 },
        { color: 'black', order: 1 }
    ],
    board: {
        height: 8,
        width: 8
    },
    winConditions: [{ condition: 'resign' }],
    drawConditions: [],
    pieces: []
};

describe('helpers', () => {
    describe('validateCaptureRules', () => {
        describe('required', () => {
            test('returns true if piece is black and destination space contains white piece', () => {
                generateCaptureTest(
                    'required',
                    'black',
                    ['c', 3],
                    ['c', 5],
                    true,
                    true
                );
            });

            test('returns false if piece is black and destination space contains no piece', () => {
                generateCaptureTest(
                    'required',
                    'black',
                    ['c', 3],
                    ['c', 5],
                    false,
                    false
                );
            });

            test('returns true if piece is white and destination space contains black piece', () => {
                generateCaptureTest(
                    'required',
                    'white',
                    ['c', 5],
                    ['c', 3],
                    true,
                    true
                );
            });

            test('returns false if piece is white and destination space contains no piece', () => {
                generateCaptureTest(
                    'required',
                    'white',
                    ['c', 5],
                    ['c', 3],
                    false,
                    false
                );
            });
        });

        describe('optional', () => {
            test('returns true if piece is black and destination space contains white piece', () => {
                generateCaptureTest(
                    'optional',
                    'black',
                    ['c', 3],
                    ['c', 5],
                    true,
                    true
                );
            });

            test('returns true if piece is black and destination space contains no piece', () => {
                generateCaptureTest(
                    'optional',
                    'black',
                    ['c', 3],
                    ['c', 5],
                    false,
                    true
                );
            });

            test('returns true if piece is white and destination space contains black piece', () => {
                generateCaptureTest(
                    'optional',
                    'white',
                    ['c', 5],
                    ['c', 3],
                    true,
                    true
                );
            });

            test('returns true if piece is white and destination space contains no piece', () => {
                generateCaptureTest(
                    'optional',
                    'white',
                    ['c', 5],
                    ['c', 3],
                    false,
                    true
                );
            });
        });

        describe('forbidden', () => {
            test('returns false if piece is black and destination space contains white piece', () => {
                generateCaptureTest(
                    'forbidden',
                    'black',
                    ['c', 3],
                    ['c', 5],
                    true,
                    false
                );
            });

            test('returns true if piece is black and destination space contains no piece', () => {
                generateCaptureTest(
                    'forbidden',
                    'black',
                    ['c', 3],
                    ['c', 5],
                    false,
                    true
                );
            });

            test('returns false if piece is white and destination space contains black piece', () => {
                generateCaptureTest(
                    'forbidden',
                    'white',
                    ['c', 5],
                    ['c', 3],
                    true,
                    false
                );
            });

            test('returns true if piece is white and destination space contains no piece', () => {
                generateCaptureTest(
                    'forbidden',
                    'white',
                    ['c', 5],
                    ['c', 3],
                    false,
                    true
                );
            });
        });
    });

    describe('positionsAreEqual', () => {
        test.each([
            {
                position1File: 'a',
                position1Rank: 3,
                position2File: 'a',
                position2Rank: 3,
                expected: true
            },
            {
                position1File: 'f',
                position1Rank: 4,
                position2File: 'f',
                position2Rank: 4,
                expected: true
            },
            {
                position1File: 'h',
                position1Rank: 8,
                position2File: 'h',
                position2Rank: 8,
                expected: true
            },
            {
                position1File: 'b',
                position1Rank: 3,
                position2File: 'c',
                position2Rank: 3,
                expected: false
            },
            {
                position1File: 'b',
                position1Rank: 3,
                position2File: 'a',
                position2Rank: 3,
                expected: false
            },
            {
                position1File: 'a',
                position1Rank: 3,
                position2File: 'a',
                position2Rank: 2,
                expected: false
            },
            {
                position1File: 'a',
                position1Rank: 3,
                position2File: 'a',
                position2Rank: 4,
                expected: false
            },
            {
                position1File: 'a',
                position1Rank: 1,
                position2File: 'h',
                position2Rank: 8,
                expected: false
            }
        ])(
            'Position 1: $position1File$position1Rank position 2: $position2File$position2Rank expected: $expected',
            ({
                position1File,
                position1Rank,
                position2File,
                position2Rank,
                expected
            }: {
                position1File: string;
                position1Rank: number;
                position2File: string;
                position2Rank: number;
                expected: boolean;
            }) => {
                const result = positionsAreEqual(
                    [position1File, position1Rank],
                    [position2File, position2Rank]
                );
                expect(result).toEqual(expected);
            }
        );
    });

    describe('reverseDirection', () => {
        test.each([
            ['forward', 'backward'],
            ['backward', 'forward'],
            ['left', 'right'],
            ['right', 'left'],
            ['leftForward', 'rightBackward'],
            ['rightForward', 'leftBackward'],
            ['leftBackward', 'rightForward'],
            ['rightBackward', 'leftForward']
        ])('input: %s expected: %s', (input: string, expected: string) => {
            const result = reverseDirection(input as Direction);
            expect(result).toEqual(expected);
        });
    });

    describe('getMoveConditionFunctions', () => {
        test('returns empty array with no conditions', () => {
            const result = getMoveConditionFunctions([]);

            expect(result).toHaveLength(0);
        });

        test('returns firstPieceMove function with ConditionFirstPieceMove input', () => {
            const input = [
                { condition: 'firstPieceMove' }
            ] as MoveCondition<testPieceNames>[];

            const result = getMoveConditionFunctions(input);

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual(firstPieceMove);
        });
    });

    describe('makeNextSpaceIterator', () => {
        describe.each([
            {
                direction: 'forward',
                color: 'white',
                startingFileIndex: 3,
                startingRankIndex: 3,
                maxLength: 5,
                firstIterationExpectedFile: 3,
                firstIterationExpectedRank: 4,
                finalIterationExpectedFile: 3,
                finalIterationExpectedRank: 8
            },
            {
                direction: 'backward',
                color: 'white',
                startingFileIndex: 3,
                startingRankIndex: 3,
                maxLength: 3,
                firstIterationExpectedFile: 3,
                firstIterationExpectedRank: 2,
                finalIterationExpectedFile: 3,
                finalIterationExpectedRank: 0
            },
            {
                direction: 'left',
                color: 'white',
                startingFileIndex: 4,
                startingRankIndex: 4,
                maxLength: 2,
                firstIterationExpectedFile: 3,
                firstIterationExpectedRank: 4,
                finalIterationExpectedFile: 2,
                finalIterationExpectedRank: 4
            },
            {
                direction: 'right',
                color: 'white',
                startingFileIndex: 3,
                startingRankIndex: 3,
                maxLength: 5,
                firstIterationExpectedFile: 4,
                firstIterationExpectedRank: 3,
                finalIterationExpectedFile: 8,
                finalIterationExpectedRank: 3
            },
            {
                direction: 'leftForward',
                color: 'white',
                startingFileIndex: 5,
                startingRankIndex: 3,
                maxLength: 3,
                firstIterationExpectedFile: 4,
                firstIterationExpectedRank: 4,
                finalIterationExpectedFile: 2,
                finalIterationExpectedRank: 6
            },
            {
                direction: 'rightForward',
                color: 'white',
                startingFileIndex: 0,
                startingRankIndex: 2,
                maxLength: 6,
                firstIterationExpectedFile: 1,
                firstIterationExpectedRank: 3,
                finalIterationExpectedFile: 6,
                finalIterationExpectedRank: 8
            },
            {
                direction: 'leftBackward',
                color: 'white',
                startingFileIndex: 6,
                startingRankIndex: 7,
                maxLength: 4,
                firstIterationExpectedFile: 5,
                firstIterationExpectedRank: 6,
                finalIterationExpectedFile: 2,
                finalIterationExpectedRank: 3
            },
            {
                direction: 'rightBackward',
                color: 'white',
                startingFileIndex: 0,
                startingRankIndex: 3,
                maxLength: 3,
                firstIterationExpectedFile: 1,
                firstIterationExpectedRank: 2,
                finalIterationExpectedFile: 3,
                finalIterationExpectedRank: 0
            },
            {
                direction: 'backward',
                color: 'black',
                startingFileIndex: 3,
                startingRankIndex: 3,
                maxLength: 5,
                firstIterationExpectedFile: 3,
                firstIterationExpectedRank: 4,
                finalIterationExpectedFile: 3,
                finalIterationExpectedRank: 8
            },
            {
                direction: 'forward',
                color: 'black',
                startingFileIndex: 3,
                startingRankIndex: 3,
                maxLength: 3,
                firstIterationExpectedFile: 3,
                firstIterationExpectedRank: 2,
                finalIterationExpectedFile: 3,
                finalIterationExpectedRank: 0
            },
            {
                direction: 'right',
                color: 'black',
                startingFileIndex: 4,
                startingRankIndex: 4,
                maxLength: 2,
                firstIterationExpectedFile: 3,
                firstIterationExpectedRank: 4,
                finalIterationExpectedFile: 2,
                finalIterationExpectedRank: 4
            },
            {
                direction: 'left',
                color: 'black',
                startingFileIndex: 3,
                startingRankIndex: 3,
                maxLength: 5,
                firstIterationExpectedFile: 4,
                firstIterationExpectedRank: 3,
                finalIterationExpectedFile: 8,
                finalIterationExpectedRank: 3
            },
            {
                direction: 'rightBackward',
                color: 'black',
                startingFileIndex: 5,
                startingRankIndex: 3,
                maxLength: 3,
                firstIterationExpectedFile: 4,
                firstIterationExpectedRank: 4,
                finalIterationExpectedFile: 2,
                finalIterationExpectedRank: 6
            },
            {
                direction: 'leftBackward',
                color: 'black',
                startingFileIndex: 0,
                startingRankIndex: 2,
                maxLength: 6,
                firstIterationExpectedFile: 1,
                firstIterationExpectedRank: 3,
                finalIterationExpectedFile: 6,
                finalIterationExpectedRank: 8
            },
            {
                direction: 'rightForward',
                color: 'black',
                startingFileIndex: 6,
                startingRankIndex: 7,
                maxLength: 4,
                firstIterationExpectedFile: 5,
                firstIterationExpectedRank: 6,
                finalIterationExpectedFile: 2,
                finalIterationExpectedRank: 3
            },
            {
                direction: 'leftForward',
                color: 'black',
                startingFileIndex: 0,
                startingRankIndex: 3,
                maxLength: 3,
                firstIterationExpectedFile: 1,
                firstIterationExpectedRank: 2,
                finalIterationExpectedFile: 3,
                finalIterationExpectedRank: 0
            }
        ])(
            'direction: $direction, color: $color, starting position: [$startingFileIndex, $startingRankIndex]',
            ({
                direction,
                color,
                startingFileIndex,
                startingRankIndex,
                maxLength,
                firstIterationExpectedFile,
                firstIterationExpectedRank,
                finalIterationExpectedFile,
                finalIterationExpectedRank
            }: {
                direction: string;
                color: string;
                startingFileIndex: number;
                startingRankIndex: number;
                maxLength: number;
                firstIterationExpectedFile: number;
                firstIterationExpectedRank: number;
                finalIterationExpectedFile: number;
                finalIterationExpectedRank: number;
            }) => {
                test(`First iteration is at [${firstIterationExpectedFile}, ${firstIterationExpectedRank}]`, () => {
                    const iterator = makeNextSpaceIterator(
                        direction as Direction,
                        startingFileIndex,
                        startingRankIndex,
                        maxLength,
                        color as PlayerColor
                    );
                    const result = iterator.next();
                    expect(result.value).toEqual([
                        firstIterationExpectedFile,
                        firstIterationExpectedRank
                    ]);
                });

                test(`Final iteration after ${maxLength} is at [${finalIterationExpectedFile}, ${finalIterationExpectedRank}]`, () => {
                    let result;
                    for (const space of makeNextSpaceIterator(
                        direction as Direction,
                        startingFileIndex,
                        startingRankIndex,
                        maxLength,
                        color as PlayerColor
                    )) {
                        result = space;
                    }

                    expect(result).toEqual([
                        finalIterationExpectedFile,
                        finalIterationExpectedRank
                    ]);
                });
            }
        );
    });
});

function generateCaptureTest(
    captureAvailability: CaptureAvailability,
    playerColor: PlayerColor,
    startingPosition: BoardPosition,
    destinationPosition: BoardPosition,
    pieceOnPosition: boolean,
    expected: boolean
) {
    const captureColor: PlayerColor =
        playerColor === 'white' ? 'black' : 'white';
    const pieceConfig: PieceConfig<testPieceNames> = {
        name: 'foo',
        notation: 'P',
        displayCharacters: {
            white: 'P',
            black: 'p'
        },
        moves: [],
        startingPositions: {
            [playerColor]: [startingPosition]
        }
    };

    const capturePieceConfig: PieceConfig<testPieceNames> = {
        name: 'bar',
        displayCharacters: {
            white: 'B',
            black: 'b'
        },
        notation: 'B',
        moves: [],
        startingPositions: {
            [captureColor]: [destinationPosition]
        }
    };
    const config: GameRules<testPieceNames> = {
        ...rulesConfig,
        pieces: pieceOnPosition
            ? [pieceConfig, capturePieceConfig]
            : [pieceConfig]
    };
    const engine = new GameEngine(config);
    const board = engine.board;
    const piece = board.getSpace(startingPosition).piece!;

    const result = validateCaptureRules(
        piece,
        board,
        destinationPosition,
        captureAvailability
    );

    expect(result).toEqual(expected);
}
