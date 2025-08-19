import {
    BoardPosition,
    CaptureAvailability,
    Direction,
    GameError,
    MoveCondition,
    PlayerColor
} from '../../../types';
import { GameStatePiecePlacement } from '../../gameState';
import { generateGameState } from '../../gameState/generateGameState';
import {
    getMoveConditionFunctionsV2,
    makeNextSpaceIterator,
    positionsAreEqual,
    reverseDirection,
    validateCaputureRulesV2
} from './helpers';

import * as MoveRestrictions from './restrictions';

jest.mock('./restrictions', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        __esModule: true,
        ...jest.requireActual('./restrictions')
    };
});

type testPieceNames = ['foo', 'bar'];

describe('helpers', () => {
    describe('validateCaptureRulesV2', () => {
        test('Throws error if no piece on origin space', () => {
            const piecePlacements: GameStatePiecePlacement<testPieceNames>[] = [
                {
                    piece: { color: 'white', moveCount: 0, name: 'foo' },
                    position: ['a', 1]
                }
            ];
            const state = generateGameState(piecePlacements, 'white', {
                width: 8,
                height: 8
            });
            expect(() =>
                validateCaputureRulesV2(state, ['b', 2], ['c', 3], 'optional')
            ).toThrow(GameError);
        });
        describe('required', () => {
            test('returns true if piece is black and destination space contains white piece', () => {
                generateCaptureTestV2(
                    'required',
                    'black',
                    ['c', 3],
                    ['c', 5],
                    true,
                    true
                );
            });

            test('returns false if piece is black and destination space contains no piece', () => {
                generateCaptureTestV2(
                    'required',
                    'black',
                    ['c', 3],
                    ['c', 5],
                    false,
                    false
                );
            });

            test('returns true if piece is white and destination space contains black piece', () => {
                generateCaptureTestV2(
                    'required',
                    'white',
                    ['c', 5],
                    ['c', 3],
                    true,
                    true
                );
            });

            test('returns false if piece is white and destination space contains no piece', () => {
                generateCaptureTestV2(
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
                generateCaptureTestV2(
                    'optional',
                    'black',
                    ['c', 3],
                    ['c', 5],
                    true,
                    true
                );
            });

            test('returns true if piece is black and destination space contains no piece', () => {
                generateCaptureTestV2(
                    'optional',
                    'black',
                    ['c', 3],
                    ['c', 5],
                    false,
                    true
                );
            });

            test('returns true if piece is white and destination space contains black piece', () => {
                generateCaptureTestV2(
                    'optional',
                    'white',
                    ['c', 5],
                    ['c', 3],
                    true,
                    true
                );
            });

            test('returns true if piece is white and destination space contains no piece', () => {
                generateCaptureTestV2(
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
                generateCaptureTestV2(
                    'forbidden',
                    'black',
                    ['c', 3],
                    ['c', 5],
                    true,
                    false
                );
            });

            test('returns true if piece is black and destination space contains no piece', () => {
                generateCaptureTestV2(
                    'forbidden',
                    'black',
                    ['c', 3],
                    ['c', 5],
                    false,
                    true
                );
            });

            test('returns false if piece is white and destination space contains black piece', () => {
                generateCaptureTestV2(
                    'forbidden',
                    'white',
                    ['c', 5],
                    ['c', 3],
                    true,
                    false
                );
            });

            test('returns true if piece is white and destination space contains no piece', () => {
                generateCaptureTestV2(
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

    describe('getMoveConditionFunctionsV2', () => {
        afterEach(() => {
            jest.restoreAllMocks();
        });
        test('returns empty array with no conditions', () => {
            const result = getMoveConditionFunctionsV2([]);

            expect(result).toHaveLength(0);
        });

        test('returns firstPieceMove function with ConditionFirstPieceMove input', () => {
            const input: MoveCondition<testPieceNames>[] = [
                { condition: 'firstPieceMove' }
            ];

            const result = getMoveConditionFunctionsV2(input);

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual(MoveRestrictions.firstPieceMoveV2);
        });

        test('returns otherPieceHasNotMoved function with otherPieceHasNotMoved input', () => {
            const testFunction = () => {
                return true;
            };
            jest.spyOn(
                MoveRestrictions,
                'generateOtherPieceHasNotMovedFunctionV2'
            ).mockImplementation(() => {
                return testFunction;
            });

            const input: MoveCondition<testPieceNames>[] = [
                {
                    condition: 'otherPieceHasNotMoved',
                    piece: 'bar',
                    piecePositionForColor: {}
                }
            ];
            const result = getMoveConditionFunctionsV2(input);

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual(testFunction);
        });

        test('returns spacesNotThreatened function with spacesNotThreatened input', () => {
            const testFunction = () => {
                return true;
            };
            jest.spyOn(
                MoveRestrictions,
                'generateSpacesNotThreatenedFunctionV2'
            ).mockImplementation(() => {
                return testFunction;
            });

            const input: MoveCondition<testPieceNames>[] = [
                {
                    condition: 'spacesNotThreatened',
                    spacesForColor: {}
                }
            ];
            const result = getMoveConditionFunctionsV2(input);

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual(testFunction);
        });

        test('returns array of size 2 if input has two conditions', () => {
            const input: MoveCondition<testPieceNames>[] = [
                { condition: 'firstPieceMove' },
                {
                    condition: 'otherPieceHasNotMoved',
                    piece: 'bar',
                    piecePositionForColor: {}
                }
            ];

            const result = getMoveConditionFunctionsV2(input);

            expect(result).toHaveLength(2);
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

function generateCaptureTestV2(
    captureAvailability: CaptureAvailability,
    playerColor: PlayerColor,
    startingPosition: BoardPosition,
    destinationPosition: BoardPosition,
    pieceOnPosition: boolean,
    expected: boolean
) {
    const captureColor: PlayerColor =
        playerColor === 'white' ? 'black' : 'white';

    const movePiecePlacement: GameStatePiecePlacement<testPieceNames> = {
        piece: { name: 'foo', moveCount: 0, color: playerColor },
        position: startingPosition
    };
    const capturePiecePlacement: GameStatePiecePlacement<testPieceNames> = {
        piece: { name: 'bar', moveCount: 0, color: captureColor },
        position: destinationPosition
    };

    const piecePlacements: GameStatePiecePlacement<testPieceNames>[] =
        pieceOnPosition
            ? [movePiecePlacement, capturePiecePlacement]
            : [movePiecePlacement];

    const state = generateGameState(piecePlacements, playerColor, {
        width: 8,
        height: 8
    });

    const result = validateCaputureRulesV2(
        state,
        startingPosition,
        destinationPosition,
        captureAvailability
    );

    expect(result).toEqual(expected);
}
