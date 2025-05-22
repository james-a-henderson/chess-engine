import {
    GameRules,
    PieceConfig,
    RectangularBoard,
    StandardMove,
    PlayerColor,
    BoardPosition,
    InvalidSpaceError
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

    describe('forward move', () => {
        const testForwardMove: StandardMove<testPieceNames> = {
            type: 'standard',
            name: 'forward',
            directions: ['forward'],
            maxSpaces: 'unlimited',
            captureAvailability: 'optional'
        };

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
                    ...testForwardMove,
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

        describe('capture availability', () => {
            describe('required', () => {
                const testMoveCaptureRequired: StandardMove<testPieceNames> = {
                    ...testForwardMove,
                    captureAvailability: 'required'
                };

                test('returns true if piece is white and destination space contains black piece', () => {
                    generateCaptureTest(
                        testMoveCaptureRequired,
                        'white',
                        ['c', 3],
                        ['c', 5],
                        true
                    );
                });

                test('returns false if piece is white and destination space contains no piece', () => {
                    generateMoveTest(
                        testMoveCaptureRequired,
                        'white',
                        ['c', 3],
                        ['c', 5],
                        false
                    );
                });

                test('returns true if piece is black and destination space contains white piece', () => {
                    generateCaptureTest(
                        testMoveCaptureRequired,
                        'black',
                        ['c', 5],
                        ['c', 3],
                        true
                    );
                });

                test('returns false if piece is black and destination space contains no piece', () => {
                    generateMoveTest(
                        testMoveCaptureRequired,
                        'black',
                        ['c', 5],
                        ['c', 3],
                        false
                    );
                });
            });

            describe('optional', () => {
                const testMoveCaptureOptional: StandardMove<testPieceNames> = {
                    ...testForwardMove,
                    captureAvailability: 'optional'
                };

                test('returns true if piece is white and destination space contains black piece', () => {
                    generateCaptureTest(
                        testMoveCaptureOptional,
                        'white',
                        ['c', 3],
                        ['c', 5],
                        true
                    );
                });

                test('returns true if piece is white and destination space contains no piece', () => {
                    generateMoveTest(
                        testMoveCaptureOptional,
                        'white',
                        ['c', 3],
                        ['c', 5],
                        true
                    );
                });

                test('returns true if piece is black and destination space contains white piece', () => {
                    generateCaptureTest(
                        testMoveCaptureOptional,
                        'black',
                        ['c', 5],
                        ['c', 3],
                        true
                    );
                });

                test('returns true if piece is black and destination space contains no piece', () => {
                    generateMoveTest(
                        testMoveCaptureOptional,
                        'black',
                        ['c', 5],
                        ['c', 3],
                        true
                    );
                });
            });

            describe('forbidden', () => {
                const testMoveCaptureForbidden: StandardMove<testPieceNames> = {
                    ...testForwardMove,
                    captureAvailability: 'forbidden'
                };

                test('returns false if piece is white and destination space contains black piece', () => {
                    generateCaptureTest(
                        testMoveCaptureForbidden,
                        'white',
                        ['c', 3],
                        ['c', 5],
                        false
                    );
                });

                test('returns true if piece is white and destination space contains no piece', () => {
                    generateMoveTest(
                        testMoveCaptureForbidden,
                        'white',
                        ['c', 3],
                        ['c', 5],
                        true
                    );
                });

                test('returns false if piece is black and destination space contains white piece', () => {
                    generateCaptureTest(
                        testMoveCaptureForbidden,
                        'black',
                        ['c', 5],
                        ['c', 3],
                        false
                    );
                });

                test('returns true if piece is black and destination space contains no piece', () => {
                    generateMoveTest(
                        testMoveCaptureForbidden,
                        'black',
                        ['c', 5],
                        ['c', 3],
                        true
                    );
                });
            });
        });

        describe('Piece in between starting position and destination position', () => {
            test('Returns false if piece is white and black piece is in the way', () => {
                generatePieceInBetweenTest(
                    testForwardMove,
                    'white',
                    'black',
                    ['c', 3],
                    ['c', 5],
                    ['c', 4],
                    false
                );
            });

            test('Returns false if piece is white and white piece is in the way', () => {
                generatePieceInBetweenTest(
                    testForwardMove,
                    'white',
                    'white',
                    ['a', 2],
                    ['a', 8],
                    ['a', 5],
                    false
                );
            });

            test('Returns false if piece is black and white piece is in the way', () => {
                generatePieceInBetweenTest(
                    testForwardMove,
                    'black',
                    'white',
                    ['f', 6],
                    ['f', 1],
                    ['f', 4],
                    false
                );
            });

            test('Returns false if piece is black and black piece is in the way', () => {
                generatePieceInBetweenTest(
                    testForwardMove,
                    'black',
                    'black',
                    ['b', 3],
                    ['b', 1],
                    ['b', 2],
                    false
                );
            });
        });

        describe('Piece of same color on destination', () => {
            test('Returns false if piece is white and white piece is on destination', () => {
                generateSameColorPieceOnDestinationTest(
                    testForwardMove,
                    'white',
                    ['a', 4],
                    ['a', 7],
                    false
                );
            });

            test('Returns false if piece is black and black piece is on destination', () => {
                generateSameColorPieceOnDestinationTest(
                    testForwardMove,
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
                        testForwardMove,
                        color as PlayerColor,
                        [startFile, startRank],
                        [destinationFile, destinationRank]
                    );
                }
            );
        });
    });

    describe('backward move', () => {
        const testBackwardMove: StandardMove<testPieceNames> = {
            type: 'standard',
            name: 'backward',
            directions: ['backward'],
            maxSpaces: 'unlimited',
            captureAvailability: 'optional'
        };

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
                    ...testBackwardMove,
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

        describe('capture availability', () => {
            describe('required', () => {
                const testMoveCaptureRequired: StandardMove<testPieceNames> = {
                    ...testBackwardMove,
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
                    ...testBackwardMove,
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
                    ...testBackwardMove,
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
            test('Returns false if piece is black and white piece is in the way', () => {
                generatePieceInBetweenTest(
                    testBackwardMove,
                    'black',
                    'white',
                    ['c', 3],
                    ['c', 5],
                    ['c', 4],
                    false
                );
            });

            test('Returns false if piece is black and black piece is in the way', () => {
                generatePieceInBetweenTest(
                    testBackwardMove,
                    'black',
                    'black',
                    ['a', 2],
                    ['a', 8],
                    ['a', 5],
                    false
                );
            });

            test('Returns false if piece is white and black piece is in the way', () => {
                generatePieceInBetweenTest(
                    testBackwardMove,
                    'white',
                    'black',
                    ['f', 6],
                    ['f', 1],
                    ['f', 4],
                    false
                );
            });

            test('Returns false if piece is white and white piece is in the way', () => {
                generatePieceInBetweenTest(
                    testBackwardMove,
                    'white',
                    'white',
                    ['b', 3],
                    ['b', 1],
                    ['b', 2],
                    false
                );
            });
        });

        describe('Piece of same color on destination', () => {
            test('Returns false if piece is black and black piece is on destination', () => {
                generateSameColorPieceOnDestinationTest(
                    testBackwardMove,
                    'black',
                    ['a', 4],
                    ['a', 7],
                    false
                );
            });

            test('Returns false if piece is white and white piece is on destination', () => {
                generateSameColorPieceOnDestinationTest(
                    testBackwardMove,
                    'white',
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
                        testBackwardMove,
                        color as PlayerColor,
                        [startFile, startRank],
                        [destinationFile, destinationRank]
                    );
                }
            );
        });
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
    otherPiecePosition: BoardPosition,
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

    expect(moveFunction(engine, piece, destinationPosition)).toEqual(expected);
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
