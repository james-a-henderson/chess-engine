import {
    RectangularBoardConfig,
    JumpMove,
    JumpCoordinate,
    BoardPosition,
    PlayerColor,
    CaptureAvailability,
    AvailableMoves
} from '../../../../types';
import { generateGetLegalJumpMovesFunction } from './jumpMove';

import * as helperFunctions from '../helpers';
import { PiecePlacement } from '../../../gameState';
import { generateGameState } from '../../../gameState/generateGameState';
import { getOtherPlayerColor } from '../../../../common';

type testPieceNames = ['foo'];

const boardConfig: RectangularBoardConfig = {
    height: 8,
    width: 8
};

const baseMoveConfig: JumpMove<testPieceNames> = {
    type: 'jump',
    name: 'test',
    captureAvailability: 'optional',
    jumpCoordinates: [] //override on tests
};

describe('generateGetLegalJumpMovesFunction', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    test('Returns expected moves with only one coordinate', () => {
        const coordinates: JumpCoordinate[] = [
            { horizontalSpaces: 2, verticalSpaces: 2 }
        ];

        const result = getTestResult(coordinates, ['d', 4]);

        expect(result.moves).toEqual([['f', 6]]);
    });

    test('Returns empty array when move has no coordinates', () => {
        const result = getTestResult([], ['d', 4]);

        expect(result.moves).toHaveLength(0);
    });

    test('Returns multiple multiple values with multiple legal coordinates', () => {
        const coordinates: JumpCoordinate[] = [
            { horizontalSpaces: 2, verticalSpaces: 2 },
            { horizontalSpaces: 2, verticalSpaces: -2 },
            { horizontalSpaces: -2, verticalSpaces: -2 },
            { horizontalSpaces: -2, verticalSpaces: 2 }
        ];

        const result = getTestResult(coordinates, ['d', 4]);

        expect(result.moves).toHaveLength(4);
        expect(result.moves).toContainEqual(['f', 6]);
        expect(result.moves).toContainEqual(['f', 2]);
        expect(result.moves).toContainEqual(['b', 2]);
        expect(result.moves).toContainEqual(['b', 6]);
    });

    test('Reverses coordinates for black piece', () => {
        const coordinates: JumpCoordinate[] = [
            { horizontalSpaces: 2, verticalSpaces: -2 }
        ];

        const result = getTestResult(coordinates, ['d', 4], {
            pieceColor: 'black'
        });

        expect(result.moves).toEqual([['b', 6]]);
    });

    test('filters out positions that have same color piece', () => {
        const coordinates: JumpCoordinate[] = [
            { horizontalSpaces: 2, verticalSpaces: 2 },
            { horizontalSpaces: -2, verticalSpaces: 2 }
        ];

        const result = getTestResult(coordinates, ['d', 4], {
            sameColorStartingPositions: [['f', 6]]
        });

        expect(result.moves).toEqual([['b', 6]]);
    });

    describe('returns empty array when coordinates are off board', () => {
        test('top side', () => {
            const coordinates: JumpCoordinate[] = [
                { horizontalSpaces: 2, verticalSpaces: 2 },
                { horizontalSpaces: -2, verticalSpaces: 2 }
            ];

            const result = getTestResult(coordinates, ['d', 7]);
            expect(result.moves).toHaveLength(0);
        });

        test('bottom side', () => {
            const coordinates: JumpCoordinate[] = [
                { horizontalSpaces: 2, verticalSpaces: -2 },
                { horizontalSpaces: -2, verticalSpaces: -2 }
            ];

            const result = getTestResult(coordinates, ['e', 1]);
            expect(result.moves).toHaveLength(0);
        });

        test('left side', () => {
            const coordinates: JumpCoordinate[] = [
                { horizontalSpaces: -2, verticalSpaces: 2 },
                { horizontalSpaces: -2, verticalSpaces: -2 }
            ];

            const result = getTestResult(coordinates, ['b', 5]);
            expect(result.moves).toHaveLength(0);
        });
        test('right side', () => {
            const coordinates: JumpCoordinate[] = [
                { horizontalSpaces: 2, verticalSpaces: 2 },
                { horizontalSpaces: 2, verticalSpaces: -2 }
            ];

            const result = getTestResult(coordinates, ['h', 3]);
            expect(result.moves).toHaveLength(0);
        });
    });

    describe('capture availability', () => {
        describe('moves property', () => {
            test('Filters empty spaces when capture is required', () => {
                const coordinates: JumpCoordinate[] = [
                    { horizontalSpaces: 2, verticalSpaces: 2 },
                    { horizontalSpaces: -2, verticalSpaces: 2 }
                ];

                const result = getTestResult(coordinates, ['d', 4], {
                    captureAvailability: 'required',
                    otherColorStartingPositions: [['f', 6]]
                });

                expect(result.moves).toEqual([['f', 6]]);
            });

            test('Filters spaces with black piece when capture is forbidden', () => {
                const coordinates: JumpCoordinate[] = [
                    { horizontalSpaces: 2, verticalSpaces: 2 },
                    { horizontalSpaces: -2, verticalSpaces: 2 }
                ];

                const result = getTestResult(coordinates, ['d', 4], {
                    captureAvailability: 'forbidden',
                    otherColorStartingPositions: [['f', 6]]
                });

                expect(result.moves).toEqual([['b', 6]]);
            });

            test('Filters no spaces when capture is optional', () => {
                const coordinates: JumpCoordinate[] = [
                    { horizontalSpaces: 2, verticalSpaces: 2 },
                    { horizontalSpaces: -2, verticalSpaces: 2 }
                ];

                const result = getTestResult(coordinates, ['d', 4], {
                    captureAvailability: 'optional',
                    otherColorStartingPositions: [['f', 6]]
                });

                expect(result.moves).toHaveLength(2);
                expect(result.moves).toContainEqual(['f', 6]);
                expect(result.moves).toContainEqual(['b', 6]);
            });
        });

        describe('captureMoves property', () => {
            test('contains capture move when capture is required', () => {
                const coordinates: JumpCoordinate[] = [
                    { horizontalSpaces: 2, verticalSpaces: 2 },
                    { horizontalSpaces: -2, verticalSpaces: 2 }
                ];

                const result = getTestResult(coordinates, ['d', 4], {
                    captureAvailability: 'required',
                    otherColorStartingPositions: [['f', 6]]
                });

                expect(result.captureMoves).toEqual([['f', 6]]);
            });

            test('contains no spaces when capture is forbidden', () => {
                const coordinates: JumpCoordinate[] = [
                    { horizontalSpaces: 2, verticalSpaces: 2 },
                    { horizontalSpaces: -2, verticalSpaces: 2 }
                ];

                const result = getTestResult(coordinates, ['d', 4], {
                    captureAvailability: 'forbidden',
                    otherColorStartingPositions: [['f', 6]]
                });

                expect(result.captureMoves).toHaveLength(0);
            });

            test('contains capture move when capture is optional', () => {
                const coordinates: JumpCoordinate[] = [
                    { horizontalSpaces: 2, verticalSpaces: 2 },
                    { horizontalSpaces: -2, verticalSpaces: 2 }
                ];

                const result = getTestResult(coordinates, ['d', 4], {
                    captureAvailability: 'optional',
                    otherColorStartingPositions: [['f', 6]]
                });

                expect(result.captureMoves).toEqual([['f', 6]]);
            });
        });

        describe('spacesThreatened', () => {
            test('contains all available spaces when capture is required', () => {
                const coordinates: JumpCoordinate[] = [
                    { horizontalSpaces: 2, verticalSpaces: 2 },
                    { horizontalSpaces: -2, verticalSpaces: 2 }
                ];

                const result = getTestResult(coordinates, ['d', 4], {
                    captureAvailability: 'required',
                    otherColorStartingPositions: [['f', 6]]
                });

                expect(result.spacesThreatened).toHaveLength(2);
                expect(result.spacesThreatened).toContainEqual(['f', 6]);
                expect(result.spacesThreatened).toContainEqual(['b', 6]);
            });

            test('contains no spaces when capture is forbidden', () => {
                const coordinates: JumpCoordinate[] = [
                    { horizontalSpaces: 2, verticalSpaces: 2 },
                    { horizontalSpaces: -2, verticalSpaces: 2 }
                ];

                const result = getTestResult(coordinates, ['d', 4], {
                    captureAvailability: 'forbidden',
                    otherColorStartingPositions: [['f', 6]]
                });

                expect(result.spacesThreatened).toHaveLength(0);
            });

            test('contains all available spaces when capture is optional', () => {
                const coordinates: JumpCoordinate[] = [
                    { horizontalSpaces: 2, verticalSpaces: 2 },
                    { horizontalSpaces: -2, verticalSpaces: 2 }
                ];

                const result = getTestResult(coordinates, ['d', 4], {
                    captureAvailability: 'optional',
                    otherColorStartingPositions: [['f', 6]]
                });

                expect(result.spacesThreatened).toHaveLength(2);
                expect(result.spacesThreatened).toContainEqual(['f', 6]);
                expect(result.spacesThreatened).toContainEqual(['b', 6]);
            });
        });
    });

    test('Returns no moves when move does not satisfy condition', () => {
        jest.spyOn(
            helperFunctions,
            'getMoveConditionFunctions'
        ).mockReturnValue([
            () => {
                return false;
            }
        ]);

        const coordinates: JumpCoordinate[] = [
            { horizontalSpaces: 2, verticalSpaces: 2 }
        ];

        const result = getTestResult(coordinates, ['d', 4]);
        expect(result).toEqual({
            moves: [],
            captureMoves: [],
            spacesThreatened: []
        });
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

        const coordinates: JumpCoordinate[] = [
            { horizontalSpaces: 2, verticalSpaces: 2 }
        ];

        const result = getTestResult(coordinates, ['d', 4]);

        expect(result).toEqual({
            moves: [['f', 6]],
            captureMoves: [],
            spacesThreatened: [['f', 6]]
        });
    });
});

function getTestResult(
    jumpCoordinates: JumpCoordinate[],
    startingPosition: BoardPosition,
    testOptions?: {
        pieceColor?: PlayerColor;
        captureAvailability?: CaptureAvailability;
        sameColorStartingPositions?: BoardPosition[];
        otherColorStartingPositions?: BoardPosition[];
    }
): AvailableMoves {
    const move: JumpMove<testPieceNames> = {
        ...baseMoveConfig,
        captureAvailability: testOptions?.captureAvailability
            ? testOptions.captureAvailability
            : 'optional',
        jumpCoordinates: jumpCoordinates
    };

    const color: PlayerColor = testOptions?.pieceColor
        ? testOptions.pieceColor
        : 'white';
    const otherColor: PlayerColor = getOtherPlayerColor(color);

    const piecePlacements: PiecePlacement<testPieceNames>[] = [
        {
            piece: { name: 'foo', color: color, moveCount: 0 },
            position: startingPosition
        }
    ];

    for (const position of testOptions?.sameColorStartingPositions ?? []) {
        piecePlacements.push({
            piece: { name: 'foo', color: color, moveCount: 0 },
            position: position
        });
    }

    for (const position of testOptions?.otherColorStartingPositions ?? []) {
        piecePlacements.push({
            piece: { name: 'foo', color: otherColor, moveCount: 0 },
            position: position
        });
    }

    const state = generateGameState(piecePlacements, color, boardConfig);

    const getMovesFunction = generateGetLegalJumpMovesFunction(move);

    return getMovesFunction(state, startingPosition, new Map());
}
