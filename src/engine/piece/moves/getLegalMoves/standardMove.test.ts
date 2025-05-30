import {
    AvailableMoves,
    BoardPosition,
    CaptureAvailability,
    Direction,
    GameRules,
    PieceConfig,
    PlayerColor,
    RectangularBoardConfig,
    StandardMove
} from '../../../../types';
import { GameEngine } from '../../../GameEngine';
import { generateGetLegalStandardMovesFunction } from './standardMove';

import * as helperFunctions from '../helpers';

type testPieceNames = ['foo'];

const boardConfig: RectangularBoardConfig = {
    height: 8,
    width: 8
};

const baseRulesConfig: GameRules<testPieceNames> = {
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

const baseMoveConfig: StandardMove<testPieceNames> = {
    type: 'standard',
    name: 'test',
    captureAvailability: 'optional',
    directions: [],
    maxSpaces: 'unlimited'
};

const basePieceConfig: PieceConfig<testPieceNames> = {
    name: 'foo',
    displayCharacters: {
        white: 'F',
        black: 'f'
    },
    notation: 'F',
    moves: [],
    startingPositions: {}
};

describe('generateGetLegalStandardMovesFunction', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });
    describe('directions', () => {
        test.each([
            {
                direction: 'forward',
                color: 'white',
                expectedPositions: [
                    ['d', 5],
                    ['d', 6],
                    ['d', 7]
                ] as BoardPosition[]
            },
            {
                direction: 'backward',
                color: 'white',
                expectedPositions: [
                    ['d', 3],
                    ['d', 2],
                    ['d', 1]
                ] as BoardPosition[]
            },
            {
                direction: 'left',
                color: 'white',
                expectedPositions: [
                    ['c', 4],
                    ['b', 4],
                    ['a', 4]
                ] as BoardPosition[]
            },
            {
                direction: 'right',
                color: 'white',
                expectedPositions: [
                    ['e', 4],
                    ['f', 4],
                    ['g', 4]
                ] as BoardPosition[]
            },
            {
                direction: 'leftForward',
                color: 'white',
                expectedPositions: [
                    ['c', 5],
                    ['b', 6],
                    ['a', 7]
                ] as BoardPosition[]
            },
            {
                direction: 'rightForward',
                color: 'white',
                expectedPositions: [
                    ['e', 5],
                    ['f', 6],
                    ['g', 7]
                ] as BoardPosition[]
            },
            {
                direction: 'leftBackward',
                color: 'white',
                expectedPositions: [
                    ['c', 3],
                    ['b', 2],
                    ['a', 1]
                ] as BoardPosition[]
            },
            {
                direction: 'rightBackward',
                color: 'white',
                expectedPositions: [
                    ['e', 3],
                    ['f', 2],
                    ['g', 1]
                ] as BoardPosition[]
            },
            {
                direction: 'backward',
                color: 'black',
                expectedPositions: [
                    ['d', 5],
                    ['d', 6],
                    ['d', 7]
                ] as BoardPosition[]
            },
            {
                direction: 'forward',
                color: 'black',
                expectedPositions: [
                    ['d', 3],
                    ['d', 2],
                    ['d', 1]
                ] as BoardPosition[]
            },
            {
                direction: 'right',
                color: 'black',
                expectedPositions: [
                    ['c', 4],
                    ['b', 4],
                    ['a', 4]
                ] as BoardPosition[]
            },
            {
                direction: 'left',
                color: 'black',
                expectedPositions: [
                    ['e', 4],
                    ['f', 4],
                    ['g', 4]
                ] as BoardPosition[]
            },
            {
                direction: 'rightBackward',
                color: 'black',
                expectedPositions: [
                    ['c', 5],
                    ['b', 6],
                    ['a', 7]
                ] as BoardPosition[]
            },
            {
                direction: 'leftBackward',
                color: 'black',
                expectedPositions: [
                    ['e', 5],
                    ['f', 6],
                    ['g', 7]
                ] as BoardPosition[]
            },
            {
                direction: 'rightForward',
                color: 'black',
                expectedPositions: [
                    ['c', 3],
                    ['b', 2],
                    ['a', 1]
                ] as BoardPosition[]
            },
            {
                direction: 'leftForward',
                color: 'black',
                expectedPositions: [
                    ['e', 3],
                    ['f', 2],
                    ['g', 1]
                ] as BoardPosition[]
            }
        ])(
            'Returns correct spaces for color $color and direction $direction',
            ({
                direction,
                color,
                expectedPositions
            }: {
                direction: string;
                color: string;
                expectedPositions: BoardPosition[];
            }) => {
                const result = getTestResult(
                    [direction as Direction],
                    3,
                    1,
                    ['d', 4],
                    { pieceColor: color as PlayerColor }
                );

                expect(result.moves).toHaveLength(3);
                for (const expectedPosition of expectedPositions) {
                    expect(result.moves).toContainEqual(expectedPosition);
                }
            }
        );
    });

    describe('capture availability', () => {
        describe('moves property', () => {
            test('filters empty spaces when capture is required', () => {
                const result = getTestResult(['forward'], 2, 1, ['a', 1], {
                    captureAvailability: 'required',
                    otherColorStartingPositions: [['a', 3]]
                });
                expect(result.moves).toEqual([['a', 3]]);
            });

            test('filters spaces with black piece when capture is forbidden', () => {
                const result = getTestResult(['forward'], 2, 1, ['a', 1], {
                    captureAvailability: 'forbidden',
                    otherColorStartingPositions: [['a', 3]]
                });
                expect(result.moves).toEqual([['a', 2]]);
            });

            test('filters no spaces when capture is optional', () => {
                const result = getTestResult(['forward'], 2, 1, ['a', 1], {
                    captureAvailability: 'optional',
                    otherColorStartingPositions: [['a', 3]]
                });
                expect(result.moves).toHaveLength(2);
                expect(result.moves).toContainEqual(['a', 2]);
                expect(result.moves).toContainEqual(['a', 3]);
            });
        });

        describe('captureMoves property', () => {
            test('contains space with black piece when capture is required', () => {
                const result = getTestResult(['forward'], 2, 1, ['a', 1], {
                    captureAvailability: 'required',
                    otherColorStartingPositions: [['a', 3]]
                });
                expect(result.captureMoves).toEqual([['a', 3]]);
            });

            test('contains no spaces when capture is forbidden', () => {
                const result = getTestResult(['forward'], 2, 1, ['a', 1], {
                    captureAvailability: 'forbidden',
                    otherColorStartingPositions: [['a', 3]]
                });
                expect(result.captureMoves).toHaveLength(0);
            });

            test('contains space with black piece when capture is optional', () => {
                const result = getTestResult(['forward'], 2, 1, ['a', 1], {
                    captureAvailability: 'optional',
                    otherColorStartingPositions: [['a', 3]]
                });
                expect(result.captureMoves).toEqual([['a', 3]]);
            });
        });

        describe('spacesThreatened property', () => {
            test('contains all available spaces capture is required', () => {
                const result = getTestResult(['forward'], 2, 1, ['a', 1], {
                    captureAvailability: 'required',
                    otherColorStartingPositions: [['a', 3]]
                });
                expect(result.spacesThreatened).toHaveLength(2);
                expect(result.spacesThreatened).toContainEqual(['a', 2]);
                expect(result.spacesThreatened).toContainEqual(['a', 3]);
            });

            test('contains no spaces when capture is forbidden', () => {
                const result = getTestResult(['forward'], 2, 1, ['a', 1], {
                    captureAvailability: 'forbidden',
                    otherColorStartingPositions: [['a', 3]]
                });
                expect(result.spacesThreatened).toHaveLength(0);
            });

            test('contains all available spaces when capture is optional', () => {
                const result = getTestResult(['forward'], 2, 1, ['a', 1], {
                    captureAvailability: 'optional',
                    otherColorStartingPositions: [['a', 3]]
                });
                expect(result.spacesThreatened).toHaveLength(2);
                expect(result.spacesThreatened).toContainEqual(['a', 2]);
                expect(result.spacesThreatened).toContainEqual(['a', 3]);
            });
        });
    });

    test('returns 8 items when directions is set to all and maxSpaces is set to 1', () => {
        const result = getTestResult('all', 1, 1, ['e', 5]);
        expect(result.moves).toHaveLength(8);
        expect(result.moves).toContainEqual(['e', 6]);
        expect(result.moves).toContainEqual(['f', 6]);
        expect(result.moves).toContainEqual(['f', 5]);
        expect(result.moves).toContainEqual(['f', 4]);
        expect(result.moves).toContainEqual(['e', 4]);
        expect(result.moves).toContainEqual(['d', 4]);
        expect(result.moves).toContainEqual(['d', 5]);
        expect(result.moves).toContainEqual(['d', 6]);
    });

    test('returns empty array when only moves are off the board', () => {
        const result = getTestResult(
            ['forward', 'left', 'leftForward', 'rightForward'],
            'unlimited',
            1,
            ['a', 8]
        );
        expect(result.moves).toHaveLength(0);
    });

    test('returns empty array when piece has no directions', () => {
        const result = getTestResult([], 'unlimited', 1, ['b', 4]);
        expect(result.moves).toHaveLength(0);
    });

    test('does not return spaces below minimum number of spaces', () => {
        const result = getTestResult(['forward'], 'unlimited', 6, ['a', 1]);
        expect(result.moves).toHaveLength(2);
        expect(result.moves).toContainEqual(['a', 7]);
        expect(result.moves).toContainEqual(['a', 8]);
    });

    test('does not return spaces above maximum number of spaces', () => {
        const result = getTestResult(['right'], 4, 1, ['a', 8]);
        expect(result.moves).toHaveLength(4);
        expect(result.moves).toContainEqual(['b', 8]);
        expect(result.moves).toContainEqual(['c', 8]);
        expect(result.moves).toContainEqual(['d', 8]);
        expect(result.moves).toContainEqual(['e', 8]);
    });

    test('returns empty array if piece is on space before minimum number of spaces has been reached', () => {
        const result = getTestResult(
            ['rightForward'],
            'unlimited',
            3,
            ['a', 1],
            { otherColorStartingPositions: [['c', 3]] }
        );
        expect(result.moves).toHaveLength(0);
    });

    test('Returns empty array when move does not satisfy condition', () => {
        jest.spyOn(
            helperFunctions,
            'getMoveConditionFunctions'
        ).mockReturnValue([
            () => {
                return false;
            }
        ]);

        const result = getTestResult(['backward'], 1, 1, ['f', 4]);
        expect(result.moves).toHaveLength(0);
    });

    test('Returns expected value when move satisfies conditions', () => {
        jest.spyOn(
            helperFunctions,
            'getMoveConditionFunctions'
        ).mockReturnValue([
            () => {
                return true;
            }
        ]);

        const result = getTestResult(['backward'], 1, 1, ['f', 4]);
        expect(result.moves).toEqual([['f', 3]]);
    });
});

function getTestResult(
    directions: Direction[] | 'all',
    maxSpaces: number | 'unlimited',
    minSpaces: number,
    startingPosition: BoardPosition,
    testOptions?: {
        pieceColor?: PlayerColor;
        captureAvailability?: CaptureAvailability;
        sameColorStartingPositions?: BoardPosition[];
        otherColorStartingPositions?: BoardPosition[];
    }
): AvailableMoves {
    const move: StandardMove<testPieceNames> = {
        ...baseMoveConfig,
        captureAvailability: testOptions?.captureAvailability
            ? testOptions.captureAvailability
            : 'optional',
        maxSpaces: maxSpaces,
        minSpaces: minSpaces,
        directions: directions
    };

    const color: PlayerColor = testOptions?.pieceColor
        ? testOptions.pieceColor
        : 'white';
    const otherColor: PlayerColor = color === 'white' ? 'black' : 'white';

    const pieceConfig: PieceConfig<testPieceNames> = {
        ...basePieceConfig,
        moves: [move],
        startingPositions: {
            [color]: testOptions?.sameColorStartingPositions
                ? [startingPosition, ...testOptions.sameColorStartingPositions]
                : [startingPosition],
            [otherColor]: testOptions?.otherColorStartingPositions
                ? testOptions.otherColorStartingPositions
                : []
        }
    };

    const rulesConfig: GameRules<testPieceNames> = {
        ...baseRulesConfig,
        pieces: [pieceConfig]
    };

    const engine = new GameEngine(rulesConfig);
    const piece = engine.getSpace(startingPosition).piece!;

    const getMovesFunction = generateGetLegalStandardMovesFunction(
        move,
        boardConfig
    );

    return getMovesFunction(engine, piece, startingPosition);
}
