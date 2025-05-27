import {
    BoardPosition,
    GameRules,
    JumpMove,
    PieceConfig,
    PlayerColor,
    RectangularBoard
} from '../../../types';
import { GameEngine } from '../../GameEngine';
import { generateVerifyJumpMoveFunctions } from './jumpMove';

type testPieceNames = ['foo'];

type jumpCoordinate = [number, number];

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

describe('generateVerifyJumpMoveFunctions', () => {
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
        const piece = engine.getSpace(['a', 1]).piece!;

        const verifyMoveFunctions = generateVerifyJumpMoveFunctions(move);
        expect(verifyMoveFunctions).toHaveLength(1);
        const moveFunction = verifyMoveFunctions[0];

        //move piece
        piece.position = ['c', 3];
        const result = moveFunction(engine, piece, ['e', 5]);
        expect(result).toEqual(false);
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
    expected: boolean
) {
    const pieceConfig: PieceConfig<testPieceNames> = {
        name: 'foo',
        notation: 'F',
        displayCharacters: {
            white: 'F',
            black: 'f'
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

    const verifyMoveFunctions = generateVerifyJumpMoveFunctions(moveConfig);
    expect(verifyMoveFunctions).toHaveLength(1);
    const moveFunction = verifyMoveFunctions[0];

    expect(moveFunction(engine, piece, destinationPosition)).toEqual(expected);
}
