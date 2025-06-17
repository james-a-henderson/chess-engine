import {
    BoardPosition,
    GameRules,
    JumpMove,
    MoveOptions,
    PieceConfig,
    PlayerColor,
    RectangularBoardConfig
} from '../../../../types';
import { RectangularBoard } from '../../../board';
import { GameEngine } from '../../../GameEngine';
import { generateVerifyJumpMoveFunctions } from './jumpMove';

type testPieceNames = ['foo', 'bar'];

type jumpCoordinate = [number, number];

const boardConfig: RectangularBoardConfig = {
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

describe('generateVerifyJumpMoveFunctions', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

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

        const pieceConfig: PieceConfig<testPieceNames> = {
            name: 'foo',
            notation: 'P',
            displayCharacters: {
                white: 'P',
                black: 'p'
            },
            moves: [move],
            startingPositions: {
                white: [['a', 1]]
            }
        };

        const config: GameRules<testPieceNames> = {
            ...rulesConfig,
            pieces: [pieceConfig]
        };
        const engine = new GameEngine(config);
        const board = engine.board;
        const piece = board.getSpace(['a', 1]).piece!;

        const moveFunction = generateVerifyJumpMoveFunctions(move);

        //simulate piece move
        piece.increaseMoveCount();
        const result = moveFunction(board, piece, ['c', 3], ['e', 5]);
        expect(result).toEqual(false);
    });

    test("generated function returns false if board's verifyMovePositionValid method returns false", () => {
        jest.spyOn(
            RectangularBoard.prototype,
            'verifyMovePositionValid'
        ).mockImplementation(() => {
            return false;
        });

        generateMoveTest(
            {
                name: 'test',
                captureAvailability: 'optional',
                jumpCoordinates: [{ horizontalSpaces: 2, verticalSpaces: 2 }],
                type: 'jump'
            },
            'white',
            ['c', 3],
            ['e', 5],
            false
        );
    });

    test("generated function returns true if board's verifyMovePositionValid method returns true", () => {
        jest.spyOn(
            RectangularBoard.prototype,
            'verifyMovePositionValid'
        ).mockImplementation(() => {
            return true;
        });

        generateMoveTest(
            {
                name: 'test',
                captureAvailability: 'optional',
                jumpCoordinates: [{ horizontalSpaces: 2, verticalSpaces: 2 }],
                type: 'jump'
            },
            'white',
            ['c', 3],
            ['e', 5],
            true
        );
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
    const otherColor: PlayerColor = playerColor === 'white' ? 'black' : 'white';

    const pieceConfig: PieceConfig<testPieceNames> = {
        name: 'foo',
        notation: 'F',
        displayCharacters: {
            white: 'F',
            black: 'f'
        },
        moves: [moveConfig],
        startingPositions: {
            [playerColor]: [startingPosition],
            [otherColor]: testOptions?.otherColorPositions
                ? testOptions.otherColorPositions
                : []
        }
    };

    const config: GameRules<testPieceNames> = {
        ...rulesConfig,
        pieces: [pieceConfig]
    };

    const engine = new GameEngine(config);
    const board = engine.board;
    const piece = board.getSpace(startingPosition).piece!;

    const moveFunction = generateVerifyJumpMoveFunctions(moveConfig);

    const moveOptions: MoveOptions<testPieceNames> | undefined =
        testOptions?.promotionTarget
            ? {
                  type: 'promotion',
                  promotionTarget: testOptions.promotionTarget
              }
            : undefined;

    const result = moveFunction(
        board,
        piece,
        startingPosition,
        destinationPosition,
        moveOptions
    );

    if (expected) {
        expect(result).toEqual({
            destinationSpace: destinationPosition,
            originSpace: startingPosition,
            moveName: moveConfig.name,
            pieceColor: playerColor,
            pieceName: pieceConfig.name,
            type: 'jump',
            promotedTo: testOptions?.promotionTarget
        });
    } else {
        expect(result).toEqual(false);
    }
}
