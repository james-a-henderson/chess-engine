import {
    RectangularBoardConfig,
    StandardMove,
    PlayerColor,
    BoardPosition,
    InvalidSpaceError,
    CaptureAvailability,
    Direction,
    emptyVerifyMovesFunction
} from '../../../../types';
import { PiecePlacement } from '../../../gameState';
import { generateGameState } from '../../../gameState/generateGameState';
import { generateVerifyStandardMoveFunction } from './standardMove';

type testPieceNames = ['generic', 'forward', 'dummy'];

const boardConfig: RectangularBoardConfig = {
    height: 8,
    width: 8
};

const testMoveBase = {
    type: 'standard' as const,
    maxSpaces: 'unlimited' as const,
    captureAvailability: 'optional' as CaptureAvailability
};

const forwardMove: StandardMove<testPieceNames> = {
    ...testMoveBase,
    name: 'forward',
    directions: ['forward']
};

const backwardMove: StandardMove<testPieceNames> = {
    ...testMoveBase,
    name: 'backward',
    directions: ['backward']
};

const leftMove: StandardMove<testPieceNames> = {
    ...testMoveBase,
    name: 'left',
    directions: ['left']
};

const rightMove: StandardMove<testPieceNames> = {
    ...testMoveBase,
    name: 'right',
    directions: ['right']
};
const leftForwardMove: StandardMove<testPieceNames> = {
    ...testMoveBase,
    name: 'leftForward',
    directions: ['leftForward']
};
const rightForwardMove: StandardMove<testPieceNames> = {
    ...testMoveBase,
    name: 'rightForward',
    directions: ['rightForward']
};
const leftBackwardMove: StandardMove<testPieceNames> = {
    ...testMoveBase,
    name: 'leftBackward',
    directions: ['leftBackward']
};
const rightBackwardMove: StandardMove<testPieceNames> = {
    ...testMoveBase,
    name: 'rightBackward',
    directions: ['rightBackward']
};

describe('generateVerifyStandardMoveFunctions', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });
    test('returns emptyVerifyMovesFunction when move has no directions', () => {
        const move: StandardMove<testPieceNames> = {
            name: 'none',
            captureAvailability: 'optional',
            directions: [],
            maxSpaces: 'unlimited',
            type: 'standard'
        };

        const result = generateVerifyStandardMoveFunction('generic', move);
        expect(result).toEqual(emptyVerifyMovesFunction);
    });

    //don't have move condition functions implemented yet
    test('generated Function returns false if move has firstPieceMove condition and piece has moved', () => {
        const move: StandardMove<testPieceNames> = {
            name: 'condition',
            captureAvailability: 'optional',
            directions: ['forward'],
            maxSpaces: 'unlimited',
            type: 'standard',
            moveConditions: [
                {
                    condition: 'firstPieceMove'
                }
            ]
        };

        const piecePlacements: PiecePlacement<testPieceNames>[] = [
            {
                piece: { name: 'generic', color: 'white', moveCount: 1 },
                position: ['a', 2]
            }
        ];

        const state = generateGameState(piecePlacements, 'white', boardConfig);

        const moveFunction = generateVerifyStandardMoveFunction(
            'generic',
            move
        );

        const result = moveFunction(state, ['a', 2], ['a', 3], new Map());
        expect(result).toEqual(false);
    });

    test('generated function returns promotedTo if promotion is specified in moveOptions', () => {
        const move: StandardMove<testPieceNames> = {
            name: 'test',
            captureAvailability: 'optional',
            directions: ['forward'],
            maxSpaces: 'unlimited',
            type: 'standard'
        };

        const piecePlacements: PiecePlacement<testPieceNames>[] = [
            {
                piece: { name: 'generic', color: 'white', moveCount: 1 },
                position: ['a', 1]
            }
        ];

        const state = generateGameState(piecePlacements, 'white', boardConfig);

        const moveFunction = generateVerifyStandardMoveFunction(
            'generic',
            move
        );

        const result = moveFunction(
            state,
            ['a', 1],
            ['a', 2],
            new Map(),
            undefined,
            {
                type: 'promotion',
                promotionTarget: 'dummy'
            }
        );
        expect(result).toEqual({
            destinationSpace: ['a', 2],
            originSpace: ['a', 1],
            moveName: 'test',
            pieceColor: 'white',
            pieceName: 'generic',
            type: 'standard',
            promotedTo: 'dummy'
        });
    });

    describe('Piece in between starting position and destination position', () => {
        test.each([
            {
                moveConfig: backwardMove,
                testPieceColor: 'black',
                otherPieceColor: 'white',
                startingPosition: ['c', 3],
                destinationPosition: ['c', 5],
                otherPiecePosition: ['c', 4]
            },
            {
                moveConfig: forwardMove,
                testPieceColor: 'black',
                otherPieceColor: 'black',
                startingPosition: ['a', 8],
                destinationPosition: ['a', 2],
                otherPiecePosition: ['a', 5]
            },
            {
                moveConfig: leftMove,
                testPieceColor: 'white',
                otherPieceColor: 'black',
                startingPosition: ['f', 6],
                destinationPosition: ['a', 6],
                otherPiecePosition: ['c', 6]
            },
            {
                moveConfig: rightMove,
                testPieceColor: 'white',
                otherPieceColor: 'white',
                startingPosition: ['c', 3],
                destinationPosition: ['g', 3],
                otherPiecePosition: ['f', 3]
            },
            {
                moveConfig: leftForwardMove,
                testPieceColor: 'white',
                otherPieceColor: 'white',
                startingPosition: ['c', 3],
                destinationPosition: ['a', 5],
                otherPiecePosition: ['b', 4]
            },
            {
                moveConfig: rightForwardMove,
                testPieceColor: 'white',
                otherPieceColor: 'black',
                startingPosition: ['a', 1],
                destinationPosition: ['e', 5],
                otherPiecePosition: ['c', 3]
            },
            {
                moveConfig: leftBackwardMove,
                testPieceColor: 'white',
                otherPieceColor: 'black',
                startingPosition: ['g', 5],
                destinationPosition: ['e', 3],
                otherPiecePosition: ['f', 4]
            },
            {
                moveConfig: rightBackwardMove,
                testPieceColor: 'white',
                otherPieceColor: 'white',
                startingPosition: ['e', 7],
                destinationPosition: ['h', 4],
                otherPiecePosition: ['g', 5]
            }
        ])(
            'In between test %#',
            ({
                moveConfig,
                testPieceColor,
                otherPieceColor,
                startingPosition,
                destinationPosition,
                otherPiecePosition
            }: {
                moveConfig: StandardMove<testPieceNames>;
                testPieceColor: string;
                otherPieceColor: string;
                startingPosition: (string | number)[];
                destinationPosition: (string | number)[];
                otherPiecePosition: (string | number)[];
            }) => {
                const testOptions: testOptions =
                    testPieceColor === otherPieceColor
                        ? {
                              sameColorStartingPositions: [
                                  otherPiecePosition as BoardPosition
                              ]
                          }
                        : {
                              otherColorStartingPositions: [
                                  otherPiecePosition as BoardPosition
                              ]
                          };

                generateMoveTest(
                    moveConfig,
                    testPieceColor as PlayerColor,
                    startingPosition as BoardPosition,
                    destinationPosition as BoardPosition,
                    false,
                    testOptions
                );
            }
        );
    });

    describe('Piece of same color on destination', () => {
        test('Returns false if piece is white and white piece is on destination', () => {
            generateMoveTest(forwardMove, 'white', ['a', 4], ['a', 7], false, {
                sameColorStartingPositions: [['a', 7]]
            });
        });

        test('Returns false if piece is black and black piece is on destination', () => {
            generateMoveTest(forwardMove, 'black', ['h', 4], ['h', 2], false, {
                sameColorStartingPositions: [['h', 2]]
            });
        });
    });

    describe('throws error when destination is invalid', () => {
        test.each([
            {
                startFile: 'a',
                startRank: 1,
                color: 'white',
                destinationFile: 'a',
                destinationRank: 10
            },
            {
                startFile: 'f',
                startRank: 2,
                color: 'black',
                destinationFile: 'k',
                destinationRank: 3
            },
            {
                startFile: 'g',
                startRank: 4,
                color: 'white',
                destinationFile: '',
                destinationRank: 5
            },
            {
                startFile: 'h',
                startRank: 8,
                color: 'black',
                destinationFile: 'a',
                destinationRank: -2
            }
        ])(
            'Throws error when destination is invalid space $destinationFile$destinationRank',
            ({
                startFile,
                startRank,
                color,
                destinationFile,
                destinationRank
            }: {
                startFile: string;
                startRank: number;
                color: string;
                destinationFile: string;
                destinationRank: number;
            }) => {
                generateThrowsErrorWhenDestinationIsInvalidTest(
                    forwardMove,
                    color as PlayerColor,
                    [startFile, startRank],
                    [destinationFile, destinationRank]
                );
            }
        );
    });

    describe('forward move', () => {
        test.each([
            {
                startFile: 'a',
                startRank: 1,
                color: 'white',
                destinationFile: 'a',
                destinationRank: 2,
                expected: true
            },
            {
                startFile: 'c',
                startRank: 5,
                color: 'white',
                destinationFile: 'c',
                destinationRank: 4,
                expected: false
            },
            {
                startFile: 'd',
                startRank: 1,
                color: 'white',
                destinationFile: 'c',
                destinationRank: 2,
                expected: false
            },
            {
                startFile: 'a',
                startRank: 1,
                color: 'white',
                destinationFile: 'a',
                destinationRank: 3,
                expected: false,
                maxSpaces: 1
            },
            {
                startFile: 'a',
                startRank: 1,
                color: 'white',
                destinationFile: 'a',
                destinationRank: 2,
                expected: true,
                maxSpaces: 1
            },
            {
                startFile: 'a',
                startRank: 1,
                color: 'white',
                destinationFile: 'a',
                destinationRank: 2,
                expected: false,
                minSpaces: 2
            },
            {
                startFile: 'a',
                startRank: 1,
                color: 'white',
                destinationFile: 'a',
                destinationRank: 3,
                expected: true,
                minSpaces: 2
            },
            {
                startFile: 'h',
                startRank: 7,
                color: 'white',
                destinationFile: 'h',
                destinationRank: 8,
                expected: true
            },
            {
                startFile: 'e',
                startRank: 4,
                color: 'white',
                destinationFile: 'e',
                destinationRank: 4,
                expected: false
            },
            {
                startFile: 'a',
                startRank: 8,
                color: 'black',
                destinationFile: 'a',
                destinationRank: 2,
                expected: true
            },
            {
                startFile: 'c',
                startRank: 5,
                color: 'black',
                destinationFile: 'c',
                destinationRank: 6,
                expected: false
            },
            {
                startFile: 'd',
                startRank: 3,
                color: 'black',
                destinationFile: 'c',
                destinationRank: 2,
                expected: false
            },
            {
                startFile: 'a',
                startRank: 8,
                color: 'black',
                destinationFile: 'a',
                destinationRank: 5,
                expected: false,
                maxSpaces: 1
            },
            {
                startFile: 'a',
                startRank: 6,
                color: 'black',
                destinationFile: 'a',
                destinationRank: 5,
                expected: true,
                maxSpaces: 1
            },
            {
                startFile: 'a',
                startRank: 2,
                color: 'black',
                destinationFile: 'a',
                destinationRank: 1,
                expected: false,
                minSpaces: 2
            },
            {
                startFile: 'a',
                startRank: 3,
                color: 'black',
                destinationFile: 'a',
                destinationRank: 1,
                expected: true,
                minSpaces: 2
            },
            {
                startFile: 'h',
                startRank: 2,
                color: 'black',
                destinationFile: 'h',
                destinationRank: 1,
                expected: true
            },
            {
                startFile: 'e',
                startRank: 4,
                color: 'black',
                destinationFile: 'e',
                destinationRank: 4,
                expected: false
            }
        ])(
            'On otherwise empty board, piece at $startFile$startRank moving to $destinationFile$destinationRank has an expected result of $expected',
            ({
                startFile,
                startRank,
                color,
                destinationFile,
                destinationRank,
                expected,
                maxSpaces,
                minSpaces
            }: {
                startFile: string;
                startRank: number;
                color: string;
                destinationFile: string;
                destinationRank: number;
                expected: boolean;
                maxSpaces?: number;
                minSpaces?: number;
            }) => {
                const moveConfig: StandardMove<testPieceNames> = {
                    ...forwardMove,
                    maxSpaces: maxSpaces ? maxSpaces : 'unlimited',
                    minSpaces: minSpaces
                };
                generateMoveTest(
                    moveConfig,
                    color as PlayerColor,
                    [startFile, startRank],
                    [destinationFile, destinationRank],
                    expected
                );
            }
        );
    });

    describe('backward move', () => {
        test.each([
            {
                startFile: 'a',
                startRank: 1,
                color: 'black',
                destinationFile: 'a',
                destinationRank: 2,
                expected: true
            },
            {
                startFile: 'c',
                startRank: 5,
                color: 'black',
                destinationFile: 'c',
                destinationRank: 4,
                expected: false
            },
            {
                startFile: 'd',
                startRank: 1,
                color: 'black',
                destinationFile: 'c',
                destinationRank: 2,
                expected: false
            },
            {
                startFile: 'a',
                startRank: 1,
                color: 'black',
                destinationFile: 'a',
                destinationRank: 3,
                expected: false,
                maxSpaces: 1
            },
            {
                startFile: 'a',
                startRank: 1,
                color: 'black',
                destinationFile: 'a',
                destinationRank: 2,
                expected: true,
                maxSpaces: 1
            },
            {
                startFile: 'a',
                startRank: 1,
                color: 'black',
                destinationFile: 'a',
                destinationRank: 2,
                expected: false,
                minSpaces: 2
            },
            {
                startFile: 'a',
                startRank: 1,
                color: 'black',
                destinationFile: 'a',
                destinationRank: 3,
                expected: true,
                minSpaces: 2
            },
            {
                startFile: 'h',
                startRank: 7,
                color: 'black',
                destinationFile: 'h',
                destinationRank: 8,
                expected: true
            },
            {
                startFile: 'e',
                startRank: 4,
                color: 'black',
                destinationFile: 'e',
                destinationRank: 4,
                expected: false
            },
            {
                startFile: 'a',
                startRank: 8,
                color: 'white',
                destinationFile: 'a',
                destinationRank: 2,
                expected: true
            },
            {
                startFile: 'c',
                startRank: 5,
                color: 'white',
                destinationFile: 'c',
                destinationRank: 6,
                expected: false
            },
            {
                startFile: 'd',
                startRank: 3,
                color: 'white',
                destinationFile: 'c',
                destinationRank: 2,
                expected: false
            },
            {
                startFile: 'a',
                startRank: 8,
                color: 'white',
                destinationFile: 'a',
                destinationRank: 5,
                expected: false,
                maxSpaces: 1
            },
            {
                startFile: 'a',
                startRank: 6,
                color: 'white',
                destinationFile: 'a',
                destinationRank: 5,
                expected: true,
                maxSpaces: 1
            },
            {
                startFile: 'a',
                startRank: 2,
                color: 'white',
                destinationFile: 'a',
                destinationRank: 1,
                expected: false,
                minSpaces: 2
            },
            {
                startFile: 'a',
                startRank: 3,
                color: 'white',
                destinationFile: 'a',
                destinationRank: 1,
                expected: true,
                minSpaces: 2
            },
            {
                startFile: 'h',
                startRank: 2,
                color: 'white',
                destinationFile: 'h',
                destinationRank: 1,
                expected: true
            },
            {
                startFile: 'e',
                startRank: 4,
                color: 'white',
                destinationFile: 'e',
                destinationRank: 4,
                expected: false
            }
        ])(
            'On otherwise empty board, piece at $startFile$startRank moving to $destinationFile$destinationRank has an expected result of $expected',
            ({
                startFile,
                startRank,
                color,
                destinationFile,
                destinationRank,
                expected,
                maxSpaces,
                minSpaces
            }: {
                startFile: string;
                startRank: number;
                color: string;
                destinationFile: string;
                destinationRank: number;
                expected: boolean;
                maxSpaces?: number;
                minSpaces?: number;
            }) => {
                const moveConfig: StandardMove<testPieceNames> = {
                    ...backwardMove,
                    maxSpaces: maxSpaces ? maxSpaces : 'unlimited',
                    minSpaces: minSpaces
                };
                generateMoveTest(
                    moveConfig,
                    color as PlayerColor,
                    [startFile, startRank],
                    [destinationFile, destinationRank],
                    expected
                );
            }
        );
    });

    describe('left move', () => {
        test.each([
            {
                startFile: 'c',
                startRank: 1,
                color: 'white',
                destinationFile: 'a',
                destinationRank: 1,
                expected: true
            },
            {
                startFile: 'c',
                startRank: 1,
                color: 'white',
                destinationFile: 'a',
                destinationRank: 2,
                expected: false
            },
            {
                startFile: 'b',
                startRank: 4,
                color: 'white',
                destinationFile: 'a',
                destinationRank: 4,
                expected: true
            },
            {
                startFile: 'h',
                startRank: 1,
                color: 'white',
                destinationFile: 'h',
                destinationRank: 2,
                expected: false
            },
            {
                startFile: 'e',
                startRank: 6,
                color: 'white',
                destinationFile: 'g',
                destinationRank: 6,
                expected: false
            },
            {
                startFile: 'c',
                startRank: 1,
                color: 'white',
                destinationFile: 'a',
                destinationRank: 1,
                expected: true,
                minSpaces: 2
            },
            {
                startFile: 'c',
                startRank: 1,
                color: 'white',
                destinationFile: 'a',
                destinationRank: 1,
                expected: true,
                maxSpaces: 3
            },
            {
                startFile: 'c',
                startRank: 1,
                color: 'white',
                destinationFile: 'a',
                destinationRank: 1,
                expected: false,
                minSpaces: 3
            },
            {
                startFile: 'c',
                startRank: 1,
                color: 'white',
                destinationFile: 'a',
                destinationRank: 1,
                expected: false,
                maxSpaces: 1
            },
            {
                startFile: 'c',
                startRank: 1,
                color: 'black',
                destinationFile: 'a',
                destinationRank: 2,
                expected: false
            },
            {
                startFile: 'a',
                startRank: 1,
                color: 'black',
                destinationFile: 'c',
                destinationRank: 1,
                expected: true
            },
            {
                startFile: 'a',
                startRank: 2,
                color: 'black',
                destinationFile: 'c',
                destinationRank: 1,
                expected: false
            },
            {
                startFile: 'a',
                startRank: 4,
                color: 'black',
                destinationFile: 'b',
                destinationRank: 4,
                expected: true
            },
            {
                startFile: 'h',
                startRank: 2,
                color: 'black',
                destinationFile: 'h',
                destinationRank: 1,
                expected: false
            },
            {
                startFile: 'g',
                startRank: 6,
                color: 'black',
                destinationFile: 'e',
                destinationRank: 6,
                expected: false
            },
            {
                startFile: 'g',
                startRank: 6,
                color: 'black',
                destinationFile: 'e',
                destinationRank: 6,
                expected: false
            },
            {
                startFile: 'a',
                startRank: 1,
                color: 'black',
                destinationFile: 'c',
                destinationRank: 1,
                expected: true,
                minSpaces: 2
            },
            {
                startFile: 'a',
                startRank: 1,
                color: 'black',
                destinationFile: 'c',
                destinationRank: 1,
                expected: true,
                maxSpaces: 2
            },
            {
                startFile: 'a',
                startRank: 1,
                color: 'black',
                destinationFile: 'c',
                destinationRank: 1,
                expected: false,
                minSpaces: 3
            },
            {
                startFile: 'a',
                startRank: 1,
                color: 'black',
                destinationFile: 'c',
                destinationRank: 1,
                expected: false,
                maxSpaces: 1
            }
        ])(
            'On otherwise empty board, piece at $startFile$startRank moving to $destinationFile$destinationRank has an expected result of $expected',
            ({
                startFile,
                startRank,
                color,
                destinationFile,
                destinationRank,
                expected,
                maxSpaces,
                minSpaces
            }: {
                startFile: string;
                startRank: number;
                color: string;
                destinationFile: string;
                destinationRank: number;
                expected: boolean;
                maxSpaces?: number;
                minSpaces?: number;
            }) => {
                const moveConfig: StandardMove<testPieceNames> = {
                    ...leftMove,
                    maxSpaces: maxSpaces ? maxSpaces : 'unlimited',
                    minSpaces: minSpaces
                };
                generateMoveTest(
                    moveConfig,
                    color as PlayerColor,
                    [startFile, startRank],
                    [destinationFile, destinationRank],
                    expected
                );
            }
        );
    });

    describe('right move', () => {
        test.each([
            {
                startFile: 'c',
                startRank: 1,
                color: 'black',
                destinationFile: 'a',
                destinationRank: 1,
                expected: true
            },
            {
                startFile: 'c',
                startRank: 1,
                color: 'black',
                destinationFile: 'a',
                destinationRank: 2,
                expected: false
            },
            {
                startFile: 'b',
                startRank: 4,
                color: 'black',
                destinationFile: 'a',
                destinationRank: 4,
                expected: true
            },
            {
                startFile: 'h',
                startRank: 1,
                color: 'black',
                destinationFile: 'h',
                destinationRank: 2,
                expected: false
            },
            {
                startFile: 'e',
                startRank: 6,
                color: 'black',
                destinationFile: 'g',
                destinationRank: 6,
                expected: false
            },
            {
                startFile: 'c',
                startRank: 1,
                color: 'black',
                destinationFile: 'a',
                destinationRank: 1,
                expected: true,
                minSpaces: 2
            },
            {
                startFile: 'c',
                startRank: 1,
                color: 'black',
                destinationFile: 'a',
                destinationRank: 1,
                expected: true,
                maxSpaces: 3
            },
            {
                startFile: 'c',
                startRank: 1,
                color: 'black',
                destinationFile: 'a',
                destinationRank: 1,
                expected: false,
                minSpaces: 3
            },
            {
                startFile: 'c',
                startRank: 1,
                color: 'black',
                destinationFile: 'a',
                destinationRank: 1,
                expected: false,
                maxSpaces: 1
            },
            {
                startFile: 'c',
                startRank: 1,
                color: 'white',
                destinationFile: 'a',
                destinationRank: 2,
                expected: false
            },
            {
                startFile: 'a',
                startRank: 1,
                color: 'white',
                destinationFile: 'c',
                destinationRank: 1,
                expected: true
            },
            {
                startFile: 'a',
                startRank: 2,
                color: 'white',
                destinationFile: 'c',
                destinationRank: 1,
                expected: false
            },
            {
                startFile: 'a',
                startRank: 4,
                color: 'white',
                destinationFile: 'b',
                destinationRank: 4,
                expected: true
            },
            {
                startFile: 'h',
                startRank: 2,
                color: 'white',
                destinationFile: 'h',
                destinationRank: 1,
                expected: false
            },
            {
                startFile: 'g',
                startRank: 6,
                color: 'white',
                destinationFile: 'e',
                destinationRank: 6,
                expected: false
            },
            {
                startFile: 'g',
                startRank: 6,
                color: 'white',
                destinationFile: 'e',
                destinationRank: 6,
                expected: false
            },
            {
                startFile: 'a',
                startRank: 1,
                color: 'white',
                destinationFile: 'c',
                destinationRank: 1,
                expected: true,
                minSpaces: 2
            },
            {
                startFile: 'a',
                startRank: 1,
                color: 'white',
                destinationFile: 'c',
                destinationRank: 1,
                expected: true,
                maxSpaces: 2
            },
            {
                startFile: 'a',
                startRank: 1,
                color: 'white',
                destinationFile: 'c',
                destinationRank: 1,
                expected: false,
                minSpaces: 3
            },
            {
                startFile: 'a',
                startRank: 1,
                color: 'white',
                destinationFile: 'c',
                destinationRank: 1,
                expected: false,
                maxSpaces: 1
            }
        ])(
            'On otherwise empty board, piece at $startFile$startRank moving to $destinationFile$destinationRank has an expected result of $expected',
            ({
                startFile,
                startRank,
                color,
                destinationFile,
                destinationRank,
                expected,
                maxSpaces,
                minSpaces
            }: {
                startFile: string;
                startRank: number;
                color: string;
                destinationFile: string;
                destinationRank: number;
                expected: boolean;
                maxSpaces?: number;
                minSpaces?: number;
            }) => {
                const moveConfig: StandardMove<testPieceNames> = {
                    ...rightMove,
                    maxSpaces: maxSpaces ? maxSpaces : 'unlimited',
                    minSpaces: minSpaces
                };
                generateMoveTest(
                    moveConfig,
                    color as PlayerColor,
                    [startFile, startRank],
                    [destinationFile, destinationRank],
                    expected
                );
            }
        );
    });

    describe('leftForward move', () => {
        test.each([
            {
                startFile: 'c',
                startRank: 1,
                color: 'white',
                destinationFile: 'a',
                destinationRank: 3,
                expected: true
            },
            {
                startFile: 'a',
                startRank: 3,
                color: 'white',
                destinationFile: 'c',
                destinationRank: 1,
                expected: false
            },
            {
                startFile: 'g',
                startRank: 2,
                color: 'white',
                destinationFile: 'd',
                destinationRank: 4,
                expected: false
            },
            {
                startFile: 'g',
                startRank: 2,
                color: 'white',
                destinationFile: 'e',
                destinationRank: 4,
                expected: true
            },
            {
                startFile: 'f',
                startRank: 7,
                color: 'white',
                destinationFile: 'e',
                destinationRank: 8,
                expected: true
            },
            {
                startFile: 'a',
                startRank: 1,
                color: 'white',
                destinationFile: 'b',
                destinationRank: 3,
                expected: false
            },
            {
                startFile: 'c',
                startRank: 1,
                color: 'white',
                destinationFile: 'a',
                destinationRank: 3,
                expected: true,
                minSpaces: 2
            },
            {
                startFile: 'h',
                startRank: 1,
                color: 'white',
                destinationFile: 'e',
                destinationRank: 4,
                expected: true,
                maxSpaces: 3
            },
            {
                startFile: 'f',
                startRank: 5,
                color: 'white',
                destinationFile: 'e',
                destinationRank: 6,
                expected: false,
                minSpaces: 3
            },
            {
                startFile: 'h',
                startRank: 1,
                color: 'white',
                destinationFile: 'a',
                destinationRank: 8,
                expected: false,
                maxSpaces: 4
            },
            {
                startFile: 'a',
                startRank: 3,
                color: 'black',
                destinationFile: 'c',
                destinationRank: 1,
                expected: true
            },
            {
                startFile: 'c',
                startRank: 1,
                color: 'black',
                destinationFile: 'a',
                destinationRank: 3,
                expected: false
            },
            {
                startFile: 'd',
                startRank: 4,
                color: 'black',
                destinationFile: 'g',
                destinationRank: 2,
                expected: false
            },
            {
                startFile: 'e',
                startRank: 4,
                color: 'black',
                destinationFile: 'g',
                destinationRank: 2,
                expected: true
            },
            {
                startFile: 'e',
                startRank: 8,
                color: 'black',
                destinationFile: 'f',
                destinationRank: 7,
                expected: true
            },
            {
                startFile: 'b',
                startRank: 3,
                color: 'black',
                destinationFile: 'a',
                destinationRank: 1,
                expected: false
            },
            {
                startFile: 'a',
                startRank: 3,
                color: 'black',
                destinationFile: 'c',
                destinationRank: 1,
                expected: true,
                minSpaces: 2
            },
            {
                startFile: 'e',
                startRank: 4,
                color: 'black',
                destinationFile: 'h',
                destinationRank: 1,
                expected: true,
                maxSpaces: 3
            },
            {
                startFile: 'e',
                startRank: 6,
                color: 'black',
                destinationFile: 'f',
                destinationRank: 5,
                expected: false,
                minSpaces: 3
            },
            {
                startFile: 'a',
                startRank: 8,
                color: 'black',
                destinationFile: 'h',
                destinationRank: 1,
                expected: false,
                maxSpaces: 4
            }
        ])(
            'On otherwise empty board, piece at $startFile$startRank moving to $destinationFile$destinationRank has an expected result of $expected',
            ({
                startFile,
                startRank,
                color,
                destinationFile,
                destinationRank,
                expected,
                maxSpaces,
                minSpaces
            }: {
                startFile: string;
                startRank: number;
                color: string;
                destinationFile: string;
                destinationRank: number;
                expected: boolean;
                maxSpaces?: number;
                minSpaces?: number;
            }) => {
                const moveConfig: StandardMove<testPieceNames> = {
                    ...leftForwardMove,
                    maxSpaces: maxSpaces ? maxSpaces : 'unlimited',
                    minSpaces: minSpaces
                };
                generateMoveTest(
                    moveConfig,
                    color as PlayerColor,
                    [startFile, startRank],
                    [destinationFile, destinationRank],
                    expected
                );
            }
        );
    });

    describe('rightForward move', () => {
        test.each([
            {
                startFile: 'c',
                startRank: 1,
                color: 'white',
                destinationFile: 'e',
                destinationRank: 3,
                expected: true
            },
            {
                startFile: 'c',
                startRank: 1,
                color: 'white',
                destinationFile: 'c',
                destinationRank: 2,
                expected: false
            },
            {
                startFile: 'b',
                startRank: 1,
                color: 'white',
                destinationFile: 'h',
                destinationRank: 7,
                expected: true
            },
            {
                startFile: 'a',
                startRank: 1,
                color: 'white',
                destinationFile: 'd',
                destinationRank: 3,
                expected: false
            },
            {
                startFile: 'a',
                startRank: 7,
                color: 'white',
                destinationFile: 'b',
                destinationRank: 7,
                expected: false
            },
            {
                startFile: 'c',
                startRank: 7,
                color: 'white',
                destinationFile: 'd',
                destinationRank: 8,
                expected: true
            },
            {
                startFile: 'h',
                startRank: 1,
                color: 'white',
                destinationFile: 'a',
                destinationRank: 8,
                expected: false
            },
            {
                startFile: 'a',
                startRank: 1,
                color: 'white',
                destinationFile: 'c',
                destinationRank: 3,
                expected: true,
                minSpaces: 2
            },
            {
                startFile: 'a',
                startRank: 1,
                color: 'white',
                destinationFile: 'd',
                destinationRank: 4,
                expected: true,
                maxSpaces: 3
            },
            {
                startFile: 'a',
                startRank: 1,
                color: 'white',
                destinationFile: 'b',
                destinationRank: 2,
                expected: false,
                minSpaces: 3
            },
            {
                startFile: 'a',
                startRank: 1,
                color: 'white',
                destinationFile: 'h',
                destinationRank: 8,
                expected: false,
                maxSpaces: 4
            },
            {
                startFile: 'e',
                startRank: 3,
                color: 'black',
                destinationFile: 'c',
                destinationRank: 1,
                expected: true
            },
            {
                startFile: 'c',
                startRank: 2,
                color: 'black',
                destinationFile: 'c',
                destinationRank: 1,
                expected: false
            },
            {
                startFile: 'h',
                startRank: 7,
                color: 'black',
                destinationFile: 'b',
                destinationRank: 1,
                expected: true
            },
            {
                startFile: 'd',
                startRank: 3,
                color: 'black',
                destinationFile: 'a',
                destinationRank: 1,
                expected: false
            },
            {
                startFile: 'b',
                startRank: 7,
                color: 'black',
                destinationFile: 'a',
                destinationRank: 7,
                expected: false
            },
            {
                startFile: 'd',
                startRank: 8,
                color: 'black',
                destinationFile: 'c',
                destinationRank: 7,
                expected: true
            },
            {
                startFile: 'a',
                startRank: 8,
                color: 'black',
                destinationFile: 'h',
                destinationRank: 1,
                expected: false
            },
            {
                startFile: 'c',
                startRank: 3,
                color: 'black',
                destinationFile: 'a',
                destinationRank: 1,
                expected: true,
                minSpaces: 2
            },
            {
                startFile: 'd',
                startRank: 4,
                color: 'black',
                destinationFile: 'a',
                destinationRank: 1,
                expected: true,
                maxSpaces: 3
            },
            {
                startFile: 'b',
                startRank: 2,
                color: 'black',
                destinationFile: 'a',
                destinationRank: 1,
                expected: false,
                minSpaces: 3
            },
            {
                startFile: 'h',
                startRank: 8,
                color: 'black',
                destinationFile: 'a',
                destinationRank: 1,
                expected: false,
                maxSpaces: 4
            }
        ])(
            'On otherwise empty board, piece at $startFile$startRank moving to $destinationFile$destinationRank has an expected result of $expected',
            ({
                startFile,
                startRank,
                color,
                destinationFile,
                destinationRank,
                expected,
                maxSpaces,
                minSpaces
            }: {
                startFile: string;
                startRank: number;
                color: string;
                destinationFile: string;
                destinationRank: number;
                expected: boolean;
                maxSpaces?: number;
                minSpaces?: number;
            }) => {
                const moveConfig: StandardMove<testPieceNames> = {
                    ...rightForwardMove,
                    maxSpaces: maxSpaces ? maxSpaces : 'unlimited',
                    minSpaces: minSpaces
                };
                generateMoveTest(
                    moveConfig,
                    color as PlayerColor,
                    [startFile, startRank],
                    [destinationFile, destinationRank],
                    expected
                );
            }
        );
    });

    describe('leftBackward move', () => {
        test.each([
            {
                startFile: 'c',
                startRank: 1,
                color: 'black',
                destinationFile: 'e',
                destinationRank: 3,
                expected: true
            },
            {
                startFile: 'c',
                startRank: 1,
                color: 'black',
                destinationFile: 'c',
                destinationRank: 2,
                expected: false
            },
            {
                startFile: 'b',
                startRank: 1,
                color: 'black',
                destinationFile: 'h',
                destinationRank: 7,
                expected: true
            },
            {
                startFile: 'a',
                startRank: 1,
                color: 'black',
                destinationFile: 'd',
                destinationRank: 3,
                expected: false
            },
            {
                startFile: 'a',
                startRank: 7,
                color: 'black',
                destinationFile: 'b',
                destinationRank: 7,
                expected: false
            },
            {
                startFile: 'c',
                startRank: 7,
                color: 'black',
                destinationFile: 'd',
                destinationRank: 8,
                expected: true
            },
            {
                startFile: 'h',
                startRank: 1,
                color: 'black',
                destinationFile: 'a',
                destinationRank: 8,
                expected: false
            },
            {
                startFile: 'a',
                startRank: 1,
                color: 'black',
                destinationFile: 'c',
                destinationRank: 3,
                expected: true,
                minSpaces: 2
            },
            {
                startFile: 'a',
                startRank: 1,
                color: 'black',
                destinationFile: 'd',
                destinationRank: 4,
                expected: true,
                maxSpaces: 3
            },
            {
                startFile: 'a',
                startRank: 1,
                color: 'black',
                destinationFile: 'b',
                destinationRank: 2,
                expected: false,
                minSpaces: 3
            },
            {
                startFile: 'a',
                startRank: 1,
                color: 'black',
                destinationFile: 'h',
                destinationRank: 8,
                expected: false,
                maxSpaces: 4
            },
            {
                startFile: 'e',
                startRank: 3,
                color: 'white',
                destinationFile: 'c',
                destinationRank: 1,
                expected: true
            },
            {
                startFile: 'c',
                startRank: 2,
                color: 'white',
                destinationFile: 'c',
                destinationRank: 1,
                expected: false
            },
            {
                startFile: 'h',
                startRank: 7,
                color: 'white',
                destinationFile: 'b',
                destinationRank: 1,
                expected: true
            },
            {
                startFile: 'd',
                startRank: 3,
                color: 'white',
                destinationFile: 'a',
                destinationRank: 1,
                expected: false
            },
            {
                startFile: 'b',
                startRank: 7,
                color: 'white',
                destinationFile: 'a',
                destinationRank: 7,
                expected: false
            },
            {
                startFile: 'd',
                startRank: 8,
                color: 'white',
                destinationFile: 'c',
                destinationRank: 7,
                expected: true
            },
            {
                startFile: 'a',
                startRank: 8,
                color: 'white',
                destinationFile: 'h',
                destinationRank: 1,
                expected: false
            },
            {
                startFile: 'c',
                startRank: 3,
                color: 'white',
                destinationFile: 'a',
                destinationRank: 1,
                expected: true,
                minSpaces: 2
            },
            {
                startFile: 'd',
                startRank: 4,
                color: 'white',
                destinationFile: 'a',
                destinationRank: 1,
                expected: true,
                maxSpaces: 3
            },
            {
                startFile: 'b',
                startRank: 2,
                color: 'white',
                destinationFile: 'a',
                destinationRank: 1,
                expected: false,
                minSpaces: 3
            },
            {
                startFile: 'h',
                startRank: 8,
                color: 'white',
                destinationFile: 'a',
                destinationRank: 1,
                expected: false,
                maxSpaces: 4
            }
        ])(
            'On otherwise empty board, piece at $startFile$startRank moving to $destinationFile$destinationRank has an expected result of $expected',
            ({
                startFile,
                startRank,
                color,
                destinationFile,
                destinationRank,
                expected,
                maxSpaces,
                minSpaces
            }: {
                startFile: string;
                startRank: number;
                color: string;
                destinationFile: string;
                destinationRank: number;
                expected: boolean;
                maxSpaces?: number;
                minSpaces?: number;
            }) => {
                const moveConfig: StandardMove<testPieceNames> = {
                    ...leftBackwardMove,
                    maxSpaces: maxSpaces ? maxSpaces : 'unlimited',
                    minSpaces: minSpaces
                };
                generateMoveTest(
                    moveConfig,
                    color as PlayerColor,
                    [startFile, startRank],
                    [destinationFile, destinationRank],
                    expected
                );
            }
        );
    });

    describe('rightBackward move', () => {
        test.each([
            {
                startFile: 'c',
                startRank: 1,
                color: 'black',
                destinationFile: 'a',
                destinationRank: 3,
                expected: true
            },
            {
                startFile: 'a',
                startRank: 3,
                color: 'black',
                destinationFile: 'c',
                destinationRank: 1,
                expected: false
            },
            {
                startFile: 'g',
                startRank: 2,
                color: 'black',
                destinationFile: 'd',
                destinationRank: 4,
                expected: false
            },
            {
                startFile: 'g',
                startRank: 2,
                color: 'black',
                destinationFile: 'e',
                destinationRank: 4,
                expected: true
            },
            {
                startFile: 'f',
                startRank: 7,
                color: 'black',
                destinationFile: 'e',
                destinationRank: 8,
                expected: true
            },
            {
                startFile: 'a',
                startRank: 1,
                color: 'black',
                destinationFile: 'b',
                destinationRank: 3,
                expected: false
            },
            {
                startFile: 'c',
                startRank: 1,
                color: 'black',
                destinationFile: 'a',
                destinationRank: 3,
                expected: true,
                minSpaces: 2
            },
            {
                startFile: 'h',
                startRank: 1,
                color: 'black',
                destinationFile: 'e',
                destinationRank: 4,
                expected: true,
                maxSpaces: 3
            },
            {
                startFile: 'f',
                startRank: 5,
                color: 'black',
                destinationFile: 'e',
                destinationRank: 6,
                expected: false,
                minSpaces: 3
            },
            {
                startFile: 'h',
                startRank: 1,
                color: 'black',
                destinationFile: 'a',
                destinationRank: 8,
                expected: false,
                maxSpaces: 4
            },
            {
                startFile: 'a',
                startRank: 3,
                color: 'white',
                destinationFile: 'c',
                destinationRank: 1,
                expected: true
            },
            {
                startFile: 'c',
                startRank: 1,
                color: 'white',
                destinationFile: 'a',
                destinationRank: 3,
                expected: false
            },
            {
                startFile: 'd',
                startRank: 4,
                color: 'white',
                destinationFile: 'g',
                destinationRank: 2,
                expected: false
            },
            {
                startFile: 'e',
                startRank: 4,
                color: 'white',
                destinationFile: 'g',
                destinationRank: 2,
                expected: true
            },
            {
                startFile: 'e',
                startRank: 8,
                color: 'white',
                destinationFile: 'f',
                destinationRank: 7,
                expected: true
            },
            {
                startFile: 'b',
                startRank: 3,
                color: 'white',
                destinationFile: 'a',
                destinationRank: 1,
                expected: false
            },
            {
                startFile: 'a',
                startRank: 3,
                color: 'white',
                destinationFile: 'c',
                destinationRank: 1,
                expected: true,
                minSpaces: 2
            },
            {
                startFile: 'e',
                startRank: 4,
                color: 'white',
                destinationFile: 'h',
                destinationRank: 1,
                expected: true,
                maxSpaces: 3
            },
            {
                startFile: 'e',
                startRank: 6,
                color: 'white',
                destinationFile: 'f',
                destinationRank: 5,
                expected: false,
                minSpaces: 3
            },
            {
                startFile: 'a',
                startRank: 8,
                color: 'white',
                destinationFile: 'h',
                destinationRank: 1,
                expected: false,
                maxSpaces: 4
            }
        ])(
            'On otherwise empty board, piece at $startFile$startRank moving to $destinationFile$destinationRank has an expected result of $expected',
            ({
                startFile,
                startRank,
                color,
                destinationFile,
                destinationRank,
                expected,
                maxSpaces,
                minSpaces
            }: {
                startFile: string;
                startRank: number;
                color: string;
                destinationFile: string;
                destinationRank: number;
                expected: boolean;
                maxSpaces?: number;
                minSpaces?: number;
            }) => {
                const moveConfig: StandardMove<testPieceNames> = {
                    ...rightBackwardMove,
                    maxSpaces: maxSpaces ? maxSpaces : 'unlimited',
                    minSpaces: minSpaces
                };
                generateMoveTest(
                    moveConfig,
                    color as PlayerColor,
                    [startFile, startRank],
                    [destinationFile, destinationRank],
                    expected
                );
            }
        );
    });

    describe('multiple directions', () => {
        test.each([
            {
                directions: 'all',
                color: 'white',
                startingPosition: ['c', 3],
                destinationPosition: ['d', 3],
                expected: true
            },
            {
                directions: 'all',
                color: 'white',
                startingPosition: ['c', 3],
                destinationPosition: ['e', 5],
                expected: true
            },
            {
                directions: 'all',
                color: 'black',
                startingPosition: ['c', 3],
                destinationPosition: ['a', 1],
                expected: true
            },
            {
                directions: 'all',
                color: 'black',
                startingPosition: ['c', 3],
                destinationPosition: ['e', 4],
                expected: false
            },
            {
                directions: ['left', 'forward'],
                color: 'black',
                startingPosition: ['c', 3],
                destinationPosition: ['d', 3],
                expected: true
            },
            {
                directions: ['left', 'forward'],
                color: 'black',
                startingPosition: ['c', 3],
                destinationPosition: ['c', 2],
                expected: true
            },
            {
                directions: ['left', 'forward'],
                color: 'black',
                startingPosition: ['c', 3],
                destinationPosition: ['b', 3],
                expected: false
            },
            {
                directions: ['left', 'forward'],
                color: 'black',
                startingPosition: ['c', 3],
                destinationPosition: ['c', 4],
                expected: false
            },
            {
                directions: ['left', 'forward'],
                color: 'black',
                startingPosition: ['c', 3],
                destinationPosition: ['d', 3],
                expected: true
            },
            {
                directions: ['leftForward', 'rightForward'],
                color: 'white',
                startingPosition: ['d', 3],
                destinationPosition: ['c', 4],
                expected: true
            },
            {
                directions: ['leftForward', 'rightForward'],
                color: 'white',
                startingPosition: ['d', 3],
                destinationPosition: ['f', 5],
                expected: true
            },
            {
                directions: ['leftForward', 'rightForward'],
                color: 'white',
                startingPosition: ['d', 3],
                destinationPosition: ['c', 2],
                expected: false
            },
            {
                directions: ['leftForward', 'rightForward'],
                color: 'white',
                startingPosition: ['d', 3],
                destinationPosition: ['f', 1],
                expected: false
            }
        ])(
            'Multiple directions test %#',
            ({
                directions,
                color,
                startingPosition,
                destinationPosition,
                expected
            }: {
                directions: string[] | string;
                color: string;
                startingPosition: (number | string)[];
                destinationPosition: (string | number)[];
                expected: boolean;
            }) => {
                const moveConfig: StandardMove<testPieceNames> = {
                    ...testMoveBase,
                    name: 'testMove',
                    directions: directions as Direction[] | 'all'
                };

                generateMoveTest(
                    moveConfig,
                    color as PlayerColor,
                    startingPosition as BoardPosition,
                    destinationPosition as BoardPosition,
                    expected
                );
            }
        );
    });

    describe('alternate capture location', () => {
        test('Valid return value when opposite color piece is on alt capture location', () => {
            const moveConfig: StandardMove<testPieceNames> = {
                ...forwardMove,
                captureAvailability: 'required',
                alternateCaptureLocation: {
                    direction: 'left',
                    numSpaces: 1
                }
            };

            generateMoveTest(moveConfig, 'white', ['d', 4], ['d', 5], true, {
                otherColorStartingPositions: [['c', 5]],
                altCaptureLocation: ['c', 5]
            });
        });

        test('Returns false if opposite color piece is not on alt capture location', () => {
            const moveConfig: StandardMove<testPieceNames> = {
                ...forwardMove,
                captureAvailability: 'required',
                alternateCaptureLocation: {
                    direction: 'left',
                    numSpaces: 1
                }
            };

            generateMoveTest(moveConfig, 'black', ['d', 6], ['d', 5], false, {
                otherColorStartingPositions: [['c', 5]],
                altCaptureLocation: ['c', 5]
            });
        });

        test('Returns false if same color piece is on destination space', () => {
            const moveConfig: StandardMove<testPieceNames> = {
                ...forwardMove,
                captureAvailability: 'required',
                alternateCaptureLocation: {
                    direction: 'left',
                    numSpaces: 1
                }
            };

            generateMoveTest(moveConfig, 'white', ['d', 4], ['d', 5], false, {
                sameColorStartingPositions: [['d', 5]],
                otherColorStartingPositions: [['c', 5]],
                altCaptureLocation: ['c', 5]
            });
        });

        test('Returns false if opposite color piece is on destination space', () => {
            const moveConfig: StandardMove<testPieceNames> = {
                ...forwardMove,
                captureAvailability: 'required',
                alternateCaptureLocation: {
                    direction: 'right',
                    numSpaces: 1
                }
            };

            generateMoveTest(moveConfig, 'black', ['d', 6], ['d', 5], false, {
                otherColorStartingPositions: [
                    ['c', 5],
                    ['d', 5]
                ],
                altCaptureLocation: ['c', 5]
            });
        });

        test('Returns false if alternate capture location is off of board', () => {
            const moveConfig: StandardMove<testPieceNames> = {
                ...forwardMove,
                captureAvailability: 'required',
                alternateCaptureLocation: {
                    direction: 'left',
                    numSpaces: 1
                }
            };

            generateMoveTest(moveConfig, 'white', ['a', 4], ['a', 5], false, {
                otherColorStartingPositions: [['c', 5]]
            });
        });
    });
});

type testOptions = {
    sameColorStartingPositions?: BoardPosition[];
    otherColorStartingPositions?: BoardPosition[];
    altCaptureLocation?: BoardPosition;
};

function generateMoveTest(
    moveConfig: StandardMove<testPieceNames>,
    playerColor: PlayerColor,
    startingPosition: BoardPosition,
    destinationPosition: BoardPosition,
    expected: boolean,
    testOptions?: testOptions
) {
    const otherColor: PlayerColor = playerColor === 'white' ? 'black' : 'white';

    const piecePlacements: PiecePlacement<testPieceNames>[] = [
        {
            piece: { name: 'generic', color: playerColor, moveCount: 0 },
            position: startingPosition
        }
    ];

    for (const position of testOptions?.sameColorStartingPositions ?? []) {
        piecePlacements.push({
            piece: { name: 'generic', color: playerColor, moveCount: 0 },
            position: position
        });
    }

    for (const position of testOptions?.otherColorStartingPositions ?? []) {
        piecePlacements.push({
            piece: { name: 'generic', color: otherColor, moveCount: 0 },
            position: position
        });
    }

    const state = generateGameState(piecePlacements, playerColor, boardConfig);

    const moveFunction = generateVerifyStandardMoveFunction(
        'generic',
        moveConfig
    );

    const result = moveFunction(
        state,
        startingPosition,
        destinationPosition,
        new Map()
    );

    if (expected) {
        expect(result).toEqual({
            destinationSpace: destinationPosition,
            originSpace: startingPosition,
            moveName: moveConfig.name,
            pieceColor: playerColor,
            pieceName: 'generic',
            type: 'standard',
            altCaptureLocation: testOptions?.altCaptureLocation
        });
    } else {
        expect(result).toEqual(false);
    }
}

function generateThrowsErrorWhenDestinationIsInvalidTest(
    moveConfig: StandardMove<testPieceNames>,
    playerColor: PlayerColor,
    startingPosition: BoardPosition,
    destinationPosition: BoardPosition
) {
    const piecePlacements: PiecePlacement<testPieceNames>[] = [
        {
            piece: { name: 'generic', color: playerColor, moveCount: 0 },
            position: startingPosition
        }
    ];

    const state = generateGameState(piecePlacements, playerColor, boardConfig);

    const moveFunction = generateVerifyStandardMoveFunction(
        'generic',
        moveConfig
    );

    expect(() =>
        moveFunction(state, startingPosition, destinationPosition, new Map())
    ).toThrow(InvalidSpaceError);
}
