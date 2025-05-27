import {
    RectangularBoard,
    GameRules,
    JumpMove,
    PieceConfig,
    JumpCoordinate,
    BoardPosition,
    LegalMove,
    PlayerColor,
    CaptureAvailability
} from '../../../../types';
import { GameEngine } from '../../../GameEngine';
import { generateGetLegalJumpMovesFunction } from './jumpMove';

import * as helperFunctions from '../helpers';

type testPieceNames = ['foo'];

const boardConfig: RectangularBoard = {
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

const basePieceConfig: PieceConfig<testPieceNames> = {
    name: 'foo',
    displayCharacters: {
        white: 'F',
        black: 'f'
    },
    notation: 'F',
    moves: [], //override on tests
    startingPositions: {} //override on tests
};

const baseMoveConfig: JumpMove<testPieceNames> = {
    type: 'jump',
    name: 'test',
    captureAvailability: 'optional',
    jumpCoordinates: [] //override on tests
};

describe('generateGetLegalJumMovesFunction', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    test('Returns expected moves with only one coordinate', () => {
        const coordinates: JumpCoordinate[] = [
            { horizontalSpaces: 2, verticalSpaces: 2 }
        ];

        const result = getTestResult(coordinates, ['d', 4]);

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
            position: ['f', 6],
            captureStatus: 'canCapture'
        });
    });

    test('Returns empty array when move has no coordinates', () => {
        const result = getTestResult([], ['d', 4]);

        expect(result).toHaveLength(0);
    });

    test('Returns multiple multiple values with multiple legal coordinates', () => {
        const coordinates: JumpCoordinate[] = [
            { horizontalSpaces: 2, verticalSpaces: 2 },
            { horizontalSpaces: 2, verticalSpaces: -2 },
            { horizontalSpaces: -2, verticalSpaces: -2 },
            { horizontalSpaces: -2, verticalSpaces: 2 }
        ];

        const result = getTestResult(coordinates, ['d', 4]);

        expect(result).toHaveLength(4);
        expect(result).toContainEqual({
            position: ['f', 6],
            captureStatus: 'canCapture'
        });
        expect(result).toContainEqual({
            position: ['f', 2],
            captureStatus: 'canCapture'
        });
        expect(result).toContainEqual({
            position: ['b', 2],
            captureStatus: 'canCapture'
        });
        expect(result).toContainEqual({
            position: ['b', 6],
            captureStatus: 'canCapture'
        });
    });

    test('Reverses coordinates for black piece', () => {
        const coordinates: JumpCoordinate[] = [
            { horizontalSpaces: 2, verticalSpaces: -2 }
        ];

        const result = getTestResult(coordinates, ['d', 4], {
            pieceColor: 'black'
        });

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
            position: ['b', 6],
            captureStatus: 'canCapture'
        });
    });

    test('filters out positions that have same color piece', () => {
        const coordinates: JumpCoordinate[] = [
            { horizontalSpaces: 2, verticalSpaces: 2 },
            { horizontalSpaces: -2, verticalSpaces: 2 }
        ];

        const result = getTestResult(coordinates, ['d', 4], {
            sameColorStartingPositions: [['f', 6]]
        });
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
            position: ['b', 6],
            captureStatus: 'canCapture'
        });
    });

    describe('returns empty array when coordinates are off board', () => {
        test('top side', () => {
            const coordinates: JumpCoordinate[] = [
                { horizontalSpaces: 2, verticalSpaces: 2 },
                { horizontalSpaces: -2, verticalSpaces: 2 }
            ];

            const result = getTestResult(coordinates, ['d', 7]);
            expect(result).toHaveLength(0);
        });

        test('bottom side', () => {
            const coordinates: JumpCoordinate[] = [
                { horizontalSpaces: 2, verticalSpaces: -2 },
                { horizontalSpaces: -2, verticalSpaces: -2 }
            ];

            const result = getTestResult(coordinates, ['e', 1]);
            expect(result).toHaveLength(0);
        });

        test('left side', () => {
            const coordinates: JumpCoordinate[] = [
                { horizontalSpaces: -2, verticalSpaces: 2 },
                { horizontalSpaces: -2, verticalSpaces: -2 }
            ];

            const result = getTestResult(coordinates, ['b', 5]);
            expect(result).toHaveLength(0);
        });
        test('right side', () => {
            const coordinates: JumpCoordinate[] = [
                { horizontalSpaces: 2, verticalSpaces: 2 },
                { horizontalSpaces: 2, verticalSpaces: -2 }
            ];

            const result = getTestResult(coordinates, ['h', 3]);
            expect(result).toHaveLength(0);
        });
    });

    describe('capture availability', () => {
        test('Filters empty spaces when capture is required', () => {
            const coordinates: JumpCoordinate[] = [
                { horizontalSpaces: 2, verticalSpaces: 2 },
                { horizontalSpaces: -2, verticalSpaces: 2 }
            ];

            const result = getTestResult(coordinates, ['d', 4], {
                captureAvailability: 'required',
                otherColorStartingPositions: [['f', 6]]
            });
            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({
                position: ['f', 6],
                captureStatus: 'isCaptureMove'
            });
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
            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({
                position: ['b', 6],
                captureStatus: 'cannotCapture'
            });
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
            expect(result).toHaveLength(2);
            expect(result).toContainEqual({
                position: ['f', 6],
                captureStatus: 'isCaptureMove'
            });
            expect(result).toContainEqual({
                position: ['b', 6],
                captureStatus: 'canCapture'
            });
        });
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

        const coordinates: JumpCoordinate[] = [
            { horizontalSpaces: 2, verticalSpaces: 2 }
        ];

        const result = getTestResult(coordinates, ['d', 4]);
        expect(result).toHaveLength(0);
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
        expect(result).toHaveLength(1);

        expect(result[0]).toEqual({
            position: ['f', 6],
            captureStatus: 'canCapture'
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
): LegalMove[] {
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

    const getMovesFunction = generateGetLegalJumpMovesFunction(move);

    return getMovesFunction(engine, piece);
}
