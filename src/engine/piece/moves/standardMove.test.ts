import {
    GameRules,
    PieceConfig,
    RectangularBoard,
    StandardMove,
    PlayerColor,
    BoardPosition,
    InvalidSpaceError,
    CaptureAvailability
} from '../../../types';
import { GameEngine } from '../../GameEngine';
import { generateVerifyStandardMoveFunctions } from './standardMove';

type testPieceNames = ['generic', 'forward', 'dummy'];

const dummyPiece: PieceConfig<testPieceNames> = {
    name: 'dummy',
    notation: 'D',
    displayCharacters: {
        white: 'D',
        black: 'd'
    },
    moves: [],
    startingPositions: {} //override on tests
};

const boardConfig: RectangularBoard = {
    height: 8,
    width: 8
};

const rulesConfig: GameRules<testPieceNames> = {
    name: 'test',
    board: boardConfig,
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
    pieces: [] //override on tests
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
    test('returns empty array when move has no directions', () => {
        const move: StandardMove<testPieceNames> = {
            name: 'none',
            captureAvailability: 'optional',
            directions: [],
            maxSpaces: 'unlimited',
            type: 'standard'
        };

        const result = generateVerifyStandardMoveFunctions(
            move,
            'white',
            boardConfig
        );
        expect(result).toHaveLength(0);
    });

    test('returns array of size 1 when move has two directions', () => {
        const move: StandardMove<testPieceNames> = {
            name: 'none',
            captureAvailability: 'optional',
            directions: ['forward', 'backward'],
            maxSpaces: 'unlimited',
            type: 'standard'
        };

        const result = generateVerifyStandardMoveFunctions(
            move,
            'black',
            boardConfig
        );
        expect(result).toHaveLength(1);
    });

    describe('capture availability', () => {
        describe('required', () => {
            const testMoveCaptureRequired: StandardMove<testPieceNames> = {
                ...backwardMove,
                captureAvailability: 'required'
            };

            test('returns true if piece is black and destination space contains white piece', () => {
                generateCaptureTest(
                    testMoveCaptureRequired,
                    'black',
                    ['c', 3],
                    ['c', 5],
                    true
                );
            });

            test('returns false if piece is black and destination space contains no piece', () => {
                generateMoveTest(
                    testMoveCaptureRequired,
                    'black',
                    ['c', 3],
                    ['c', 5],
                    false
                );
            });

            test('returns true if piece is white and destination space contains black piece', () => {
                generateCaptureTest(
                    testMoveCaptureRequired,
                    'white',
                    ['c', 5],
                    ['c', 3],
                    true
                );
            });

            test('returns false if piece is white and destination space contains no piece', () => {
                generateMoveTest(
                    testMoveCaptureRequired,
                    'white',
                    ['c', 5],
                    ['c', 3],
                    false
                );
            });
        });

        describe('optional', () => {
            const testMoveCaptureOptional: StandardMove<testPieceNames> = {
                ...backwardMove,
                captureAvailability: 'optional'
            };

            test('returns true if piece is black and destination space contains white piece', () => {
                generateCaptureTest(
                    testMoveCaptureOptional,
                    'black',
                    ['c', 3],
                    ['c', 5],
                    true
                );
            });

            test('returns true if piece is black and destination space contains no piece', () => {
                generateMoveTest(
                    testMoveCaptureOptional,
                    'black',
                    ['c', 3],
                    ['c', 5],
                    true
                );
            });

            test('returns true if piece is white and destination space contains black piece', () => {
                generateCaptureTest(
                    testMoveCaptureOptional,
                    'white',
                    ['c', 5],
                    ['c', 3],
                    true
                );
            });

            test('returns true if piece is white and destination space contains no piece', () => {
                generateMoveTest(
                    testMoveCaptureOptional,
                    'white',
                    ['c', 5],
                    ['c', 3],
                    true
                );
            });
        });

        describe('forbidden', () => {
            const testMoveCaptureForbidden: StandardMove<testPieceNames> = {
                ...backwardMove,
                captureAvailability: 'forbidden'
            };

            test('returns false if piece is black and destination space contains white piece', () => {
                generateCaptureTest(
                    testMoveCaptureForbidden,
                    'black',
                    ['c', 3],
                    ['c', 5],
                    false
                );
            });

            test('returns true if piece is black and destination space contains no piece', () => {
                generateMoveTest(
                    testMoveCaptureForbidden,
                    'black',
                    ['c', 3],
                    ['c', 5],
                    true
                );
            });

            test('returns false if piece is white and destination space contains black piece', () => {
                generateCaptureTest(
                    testMoveCaptureForbidden,
                    'white',
                    ['c', 5],
                    ['c', 3],
                    false
                );
            });

            test('returns true if piece is white and destination space contains no piece', () => {
                generateMoveTest(
                    testMoveCaptureForbidden,
                    'white',
                    ['c', 5],
                    ['c', 3],
                    true
                );
            });
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
                generatePieceInBetweenTest(
                    moveConfig,
                    testPieceColor as PlayerColor,
                    otherPieceColor as PlayerColor,
                    startingPosition as BoardPosition,
                    destinationPosition as BoardPosition,
                    otherPiecePosition as BoardPosition
                );
            }
        );
    });

    describe('Piece of same color on destination', () => {
        test('Returns false if piece is white and white piece is on destination', () => {
            generateSameColorPieceOnDestinationTest(
                forwardMove,
                'white',
                ['a', 4],
                ['a', 7],
                false
            );
        });

        test('Returns false if piece is black and black piece is on destination', () => {
            generateSameColorPieceOnDestinationTest(
                forwardMove,
                'black',
                ['h', 4],
                ['h', 2],
                false
            );
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
});

function generateMoveTest(
    moveConfig: StandardMove<testPieceNames>,
    playerColor: PlayerColor,
    startingPosition: BoardPosition,
    destinationPosition: BoardPosition,
    expected: boolean
) {
    const pieceConfig: PieceConfig<testPieceNames> = {
        name: 'generic',
        notation: 'P',
        displayCharacters: {
            white: 'P',
            black: 'p'
        },
        moves: [moveConfig],
        startingPositions: {
            [playerColor]: [startingPosition]
        }
    };

    const config: GameRules<testPieceNames> = {
        ...rulesConfig,
        pieces: [pieceConfig]
    };

    const engine = new GameEngine(config);
    const piece = engine.getSpace(startingPosition).piece!;

    const verifyMoveFunctions = generateVerifyStandardMoveFunctions(
        moveConfig,
        playerColor,
        boardConfig
    );
    expect(verifyMoveFunctions).toHaveLength(1);
    const moveFunction = verifyMoveFunctions[0];

    expect(moveFunction(engine, piece, destinationPosition)).toEqual(expected);
}

function generateCaptureTest(
    moveConfig: StandardMove<testPieceNames>,
    playerColor: PlayerColor,
    startingPosition: BoardPosition,
    destinationPosition: BoardPosition,
    expected: boolean
) {
    const captureColor: PlayerColor =
        playerColor === 'white' ? 'black' : 'white';
    const pieceConfig: PieceConfig<testPieceNames> = {
        name: 'generic',
        notation: 'P',
        displayCharacters: {
            white: 'P',
            black: 'p'
        },
        moves: [moveConfig],
        startingPositions: {
            [playerColor]: [startingPosition]
        }
    };

    const capturePieceConfig: PieceConfig<testPieceNames> = {
        ...dummyPiece,
        startingPositions: {
            [captureColor]: [destinationPosition]
        }
    };
    const config: GameRules<testPieceNames> = {
        ...rulesConfig,
        pieces: [pieceConfig, capturePieceConfig]
    };
    const engine = new GameEngine(config);
    const piece = engine.getSpace(startingPosition).piece!;

    const verifyMoveFunctions = generateVerifyStandardMoveFunctions(
        moveConfig,
        playerColor,
        boardConfig
    );
    expect(verifyMoveFunctions).toHaveLength(1);
    const moveFunction = verifyMoveFunctions[0];

    expect(moveFunction(engine, piece, destinationPosition)).toEqual(expected);
}

function generatePieceInBetweenTest(
    moveConfig: StandardMove<testPieceNames>,
    testPieceColor: PlayerColor,
    otherPieceColor: PlayerColor,
    startingPosition: BoardPosition,
    destinationPosition: BoardPosition,
    otherPiecePosition: BoardPosition
) {
    const pieceConfig: PieceConfig<testPieceNames> = {
        name: 'generic',
        notation: 'P',
        displayCharacters: {
            white: 'P',
            black: 'p'
        },
        moves: [moveConfig],
        startingPositions: {
            [testPieceColor]: [startingPosition]
        }
    };

    const capturePieceConfig: PieceConfig<testPieceNames> = {
        ...dummyPiece,
        startingPositions: {
            [otherPieceColor]: [otherPiecePosition]
        }
    };
    const config: GameRules<testPieceNames> = {
        ...rulesConfig,
        pieces: [pieceConfig, capturePieceConfig]
    };
    const engine = new GameEngine(config);
    const piece = engine.getSpace(startingPosition).piece!;

    const verifyMoveFunctions = generateVerifyStandardMoveFunctions(
        moveConfig,
        testPieceColor,
        boardConfig
    );
    expect(verifyMoveFunctions).toHaveLength(1);
    const moveFunction = verifyMoveFunctions[0];

    expect(moveFunction(engine, piece, destinationPosition)).toEqual(false);
}

function generateSameColorPieceOnDestinationTest(
    moveConfig: StandardMove<testPieceNames>,
    playerColor: PlayerColor,
    startingPosition: BoardPosition,
    destinationPosition: BoardPosition,
    expected: boolean
) {
    const pieceConfig: PieceConfig<testPieceNames> = {
        name: 'generic',
        notation: 'P',
        displayCharacters: {
            white: 'P',
            black: 'p'
        },
        moves: [moveConfig],
        startingPositions: {
            [playerColor]: [startingPosition]
        }
    };

    const otherPieceConfig: PieceConfig<testPieceNames> = {
        ...dummyPiece,
        startingPositions: {
            [playerColor]: [destinationPosition]
        }
    };
    const config: GameRules<testPieceNames> = {
        ...rulesConfig,
        pieces: [pieceConfig, otherPieceConfig]
    };
    const engine = new GameEngine(config);
    const piece = engine.getSpace(startingPosition).piece!;

    const verifyMoveFunctions = generateVerifyStandardMoveFunctions(
        moveConfig,
        playerColor,
        boardConfig
    );
    expect(verifyMoveFunctions).toHaveLength(1);
    const moveFunction = verifyMoveFunctions[0];

    expect(moveFunction(engine, piece, destinationPosition)).toEqual(expected);
}

function generateThrowsErrorWhenDestinationIsInvalidTest(
    moveConfig: StandardMove<testPieceNames>,
    playerColor: PlayerColor,
    startingPosition: BoardPosition,
    destinationPosition: BoardPosition
) {
    const pieceConfig: PieceConfig<testPieceNames> = {
        name: 'generic',
        notation: 'P',
        displayCharacters: {
            white: 'P',
            black: 'p'
        },
        moves: [moveConfig],
        startingPositions: {
            [playerColor]: [startingPosition]
        }
    };

    const config: GameRules<testPieceNames> = {
        ...rulesConfig,
        pieces: [pieceConfig]
    };
    const engine = new GameEngine(config);
    const piece = engine.getSpace(startingPosition).piece!;

    const verifyMoveFunctions = generateVerifyStandardMoveFunctions(
        moveConfig,
        playerColor,
        boardConfig
    );
    expect(verifyMoveFunctions).toHaveLength(1);
    const moveFunction = verifyMoveFunctions[0];

    expect(() => moveFunction(engine, piece, destinationPosition)).toThrow(
        InvalidSpaceError
    );
}
