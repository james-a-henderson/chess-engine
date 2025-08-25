import { getOtherPlayerColor } from '../../../../common';
import {
    BoardPosition,
    JumpMove,
    MoveOptions,
    PlayerColor,
    RectangularBoardConfig
} from '../../../../types';
import { PiecePlacement } from '../../../gameState';
import { generateGameState } from '../../../gameState/generateGameState';
import { generateVerifyJumpMoveFunction } from './jumpMove';

type testPieceNames = ['foo', 'bar'];

type jumpCoordinate = [number, number];

const boardConfig: RectangularBoardConfig = {
    height: 8,
    width: 8
};

describe('generateVerifyJumpMoveFunction', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    //don't have move conditions implemented yet
    test('generated Function returns false if move has firstPieceMove condition and piece has moved', () => {
        const move: JumpMove<testPieceNames> = {
            name: 'condition',
            captureAvailability: 'optional',
            type: 'jump',
            jumpCoordinates: [
                {
                    horizontalSpaces: 2,
                    verticalSpaces: 2
                }
            ],
            moveConditions: [
                {
                    condition: 'firstPieceMove'
                }
            ]
        };

        const piecePlacements: PiecePlacement<testPieceNames>[] = [
            {
                piece: { name: 'foo', color: 'white', moveCount: 1 },
                position: ['c', 3]
            }
        ];

        const state = generateGameState(piecePlacements, 'white', boardConfig);

        const moveFunction = generateVerifyJumpMoveFunction('foo', move);

        const result = moveFunction(state, ['c', 3], ['e', 5], new Map());

        expect(result).toEqual(false);
    });

    test('generated function returns false if capture is forbidden and destination has opposite color piece', () => {
        generateMoveTest(
            {
                name: 'test',
                captureAvailability: 'forbidden',
                jumpCoordinates: [{ horizontalSpaces: 2, verticalSpaces: 2 }],
                type: 'jump'
            },
            'white',
            ['c', 3],
            ['e', 5],
            false,
            {
                otherColorPositions: [['e', 5]]
            }
        );
    });

    test('generated function returns promotedTo if promotion move options are configured', () => {
        generateMoveTest(
            {
                name: 'test',
                captureAvailability: 'forbidden',
                jumpCoordinates: [{ horizontalSpaces: -2, verticalSpaces: -2 }],
                type: 'jump'
            },
            'black',
            ['c', 3],
            ['e', 5],
            true,
            {
                promotionTarget: 'bar'
            }
        );
    });

    test.each([
        {
            coordinates: [[2, 1]] as jumpCoordinate[],
            color: 'white',
            startingPosition: ['a', 3] as BoardPosition,
            destinationPosition: ['c', 4] as BoardPosition,
            expected: true
        },
        {
            coordinates: [[2, 1]] as jumpCoordinate[],
            color: 'white',
            startingPosition: ['a', 3] as BoardPosition,
            destinationPosition: ['c', 5] as BoardPosition,
            expected: false
        },
        {
            coordinates: [[2, 1]] as jumpCoordinate[],
            color: 'white',
            startingPosition: ['a', 3] as BoardPosition,
            destinationPosition: ['b', 4] as BoardPosition,
            expected: false
        },
        {
            coordinates: [[2, 1]] as jumpCoordinate[],
            color: 'black',
            startingPosition: ['c', 4] as BoardPosition,
            destinationPosition: ['a', 3] as BoardPosition,
            expected: true
        },
        {
            coordinates: [[2, 1]] as jumpCoordinate[],
            color: 'black',
            startingPosition: ['c', 5] as BoardPosition,
            destinationPosition: ['a', 3] as BoardPosition,
            expected: false
        },
        {
            coordinates: [[2, 1]] as jumpCoordinate[],
            color: 'black',
            startingPosition: ['b', 4] as BoardPosition,
            destinationPosition: ['a', 3] as BoardPosition,
            expected: false
        },
        {
            coordinates: [[2, 1]] as jumpCoordinate[],
            color: 'white',
            startingPosition: ['a', 3] as BoardPosition,
            destinationPosition: ['a', 3] as BoardPosition,
            expected: false
        }
    ])(
        'Standard Jump Move test %#',
        ({
            coordinates,
            color,
            startingPosition,
            destinationPosition,
            expected
        }: {
            coordinates: jumpCoordinate[];
            color: string;
            startingPosition: BoardPosition;
            destinationPosition: BoardPosition;
            expected: boolean;
        }) => {
            const jumpCoordinates: {
                horizontalSpaces: number;
                verticalSpaces: number;
            }[] = [];

            for (const coordinate of coordinates) {
                jumpCoordinates.push({
                    horizontalSpaces: coordinate[0],
                    verticalSpaces: coordinate[1]
                });
            }

            const moveConfig: JumpMove<testPieceNames> = {
                name: 'jumpMove',
                captureAvailability: 'optional',
                type: 'jump',
                jumpCoordinates: jumpCoordinates
            };

            generateMoveTest(
                moveConfig,
                color as PlayerColor,
                startingPosition,
                destinationPosition,
                expected
            );
        }
    );
});

function generateMoveTest(
    moveConfig: JumpMove<testPieceNames>,
    playerColor: PlayerColor,
    startingPosition: BoardPosition,
    destinationPosition: BoardPosition,
    expected: boolean,
    testOptions?: {
        otherColorPositions?: BoardPosition[];
        promotionTarget?: testPieceNames[keyof testPieceNames];
    }
) {
    const otherColor: PlayerColor = getOtherPlayerColor(playerColor);

    const piecePlacements: PiecePlacement<testPieceNames>[] = [
        {
            piece: { name: 'foo', color: playerColor, moveCount: 0 },
            position: startingPosition
        }
    ];

    for (const position of testOptions?.otherColorPositions ?? []) {
        piecePlacements.push({
            piece: { name: 'foo', color: otherColor, moveCount: 0 },
            position: position
        });
    }

    const state = generateGameState(piecePlacements, playerColor, boardConfig);

    const moveFunction = generateVerifyJumpMoveFunction('foo', moveConfig);

    const moveOptions: MoveOptions<testPieceNames> | undefined =
        testOptions?.promotionTarget
            ? {
                  type: 'promotion',
                  promotionTarget: testOptions.promotionTarget
              }
            : undefined;

    const result = moveFunction(
        state,
        startingPosition,
        destinationPosition,
        new Map(),
        undefined,
        moveOptions
    );

    if (expected) {
        expect(result).toEqual({
            destinationSpace: destinationPosition,
            originSpace: startingPosition,
            moveName: moveConfig.name,
            pieceColor: playerColor,
            pieceName: 'foo',
            type: 'jump',
            promotedTo: testOptions?.promotionTarget
        });
    } else {
        expect(result).toEqual(false);
    }
}
