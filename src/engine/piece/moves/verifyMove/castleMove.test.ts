import {
    BoardPosition,
    CastleMove,
    GameRules,
    PieceConfig,
    PlayerColor
} from '../../../../types';
import { GameEngine } from '../../../GameEngine';
import { generateVerifyCastleMoveFunctions } from './castleMove';

type testPieceNames = ['king', 'rook', 'foo'];

describe('generateVerifyCastleMoveFunctions', () => {
    test('generated function returns false if move has firstPieceMove condition and piece has moved', () => {
        const moveConfig: CastleMove<testPieceNames> = {
            name: 'castleMove',
            captureAvailability: 'forbidden',
            type: 'castle',
            configForColor: {
                white: {
                    origin: ['e', 1],
                    destination: ['g', 1],
                    targetPieceName: 'rook',
                    targetPieceOrigin: ['h', 1],
                    targetPieceDestination: ['f', 1]
                }
            },
            moveConditions: [
                {
                    condition: 'firstPieceMove'
                }
            ]
        };

        generateMoveTest(moveConfig, 'white', ['e', 1], ['g', 1], false, {
            targetPiecePosition: ['h', 1],
            pieceMoves: 2
        });
    });

    test('generated function returns true if move has firstPieceMove condition and piece has not moved', () => {
        const moveConfig: CastleMove<testPieceNames> = {
            name: 'castleMove',
            captureAvailability: 'forbidden',
            type: 'castle',
            configForColor: {
                white: {
                    origin: ['e', 1],
                    destination: ['g', 1],
                    targetPieceName: 'rook',
                    targetPieceOrigin: ['h', 1],
                    targetPieceDestination: ['f', 1]
                }
            },
            moveConditions: [
                {
                    condition: 'firstPieceMove'
                }
            ]
        };

        generateMoveTest(moveConfig, 'white', ['e', 1], ['g', 1], true, {
            targetPiecePosition: ['h', 1]
        });
    });

    test('generated function returns false if opposite color piece is in between castling pieces', () => {
        const moveConfig: CastleMove<testPieceNames> = {
            name: 'castleMove',
            captureAvailability: 'forbidden',
            type: 'castle',
            configForColor: {
                white: {
                    origin: ['e', 1],
                    destination: ['g', 1],
                    targetPieceName: 'rook',
                    targetPieceOrigin: ['h', 1],
                    targetPieceDestination: ['f', 1]
                }
            }
        };

        generateMoveTest(moveConfig, 'white', ['e', 1], ['g', 1], false, {
            targetPiecePosition: ['h', 1],
            otherColorStartingPositions: [['f', 1]]
        });
    });

    test('generated function returns false if same color piece is in between castling pieces', () => {
        const moveConfig: CastleMove<testPieceNames> = {
            name: 'castleMove',
            captureAvailability: 'forbidden',
            type: 'castle',
            configForColor: {
                black: {
                    origin: ['e', 8],
                    destination: ['g', 8],
                    targetPieceName: 'rook',
                    targetPieceOrigin: ['h', 8],
                    targetPieceDestination: ['f', 8]
                }
            }
        };

        generateMoveTest(moveConfig, 'black', ['e', 8], ['g', 8], false, {
            targetPiecePosition: ['h', 8],
            sameColorStartingPositions: [['f', 8]]
        });
    });

    test.each([
        {
            color: 'white' as PlayerColor,
            origin: ['e', 1] as BoardPosition,
            destination: ['g', 1] as BoardPosition,
            targetOrigin: ['h', 1] as BoardPosition,
            targetDestination: ['f', 1] as BoardPosition,
            startingPosition: ['e', 1] as BoardPosition,
            destinationPosition: ['g', 1] as BoardPosition,
            targetStartingPosition: ['h', 1] as BoardPosition,
            expected: true
        },
        {
            color: 'black' as PlayerColor,
            origin: ['e', 8] as BoardPosition,
            destination: ['g', 8] as BoardPosition,
            targetOrigin: ['h', 8] as BoardPosition,
            targetDestination: ['f', 8] as BoardPosition,
            startingPosition: ['e', 8] as BoardPosition,
            destinationPosition: ['g', 8] as BoardPosition,
            targetStartingPosition: ['h', 8] as BoardPosition,
            expected: true
        },
        {
            color: 'white' as PlayerColor,
            origin: ['e', 1] as BoardPosition,
            destination: ['c', 1] as BoardPosition,
            targetOrigin: ['a', 1] as BoardPosition,
            targetDestination: ['d', 1] as BoardPosition,
            startingPosition: ['e', 1] as BoardPosition,
            destinationPosition: ['c', 1] as BoardPosition,
            targetStartingPosition: ['a', 1] as BoardPosition,
            expected: true
        },
        {
            color: 'black' as PlayerColor,
            origin: ['e', 8] as BoardPosition,
            destination: ['c', 8] as BoardPosition,
            targetOrigin: ['a', 8] as BoardPosition,
            targetDestination: ['d', 8] as BoardPosition,
            startingPosition: ['e', 8] as BoardPosition,
            destinationPosition: ['c', 8] as BoardPosition,
            targetStartingPosition: ['a', 8] as BoardPosition,
            expected: true
        },
        {
            color: 'white' as PlayerColor,
            origin: ['e', 1] as BoardPosition,
            destination: ['c', 1] as BoardPosition,
            targetOrigin: ['a', 1] as BoardPosition,
            targetDestination: ['d', 1] as BoardPosition,
            startingPosition: ['e', 2] as BoardPosition,
            destinationPosition: ['c', 1] as BoardPosition,
            targetStartingPosition: ['a', 1] as BoardPosition,
            expected: false
        },
        {
            color: 'black' as PlayerColor,
            origin: ['e', 8] as BoardPosition,
            destination: ['c', 8] as BoardPosition,
            targetOrigin: ['a', 8] as BoardPosition,
            targetDestination: ['d', 8] as BoardPosition,
            startingPosition: ['e', 7] as BoardPosition,
            destinationPosition: ['c', 8] as BoardPosition,
            targetStartingPosition: ['a', 8] as BoardPosition,
            expected: false
        },
        {
            color: 'white' as PlayerColor,
            origin: ['e', 1] as BoardPosition,
            destination: ['c', 1] as BoardPosition,
            targetOrigin: ['a', 1] as BoardPosition,
            targetDestination: ['d', 1] as BoardPosition,
            startingPosition: ['e', 1] as BoardPosition,
            destinationPosition: ['f', 1] as BoardPosition,
            targetStartingPosition: ['a', 1] as BoardPosition,
            expected: false
        },
        {
            color: 'black' as PlayerColor,
            origin: ['e', 8] as BoardPosition,
            destination: ['c', 8] as BoardPosition,
            targetOrigin: ['a', 8] as BoardPosition,
            targetDestination: ['d', 8] as BoardPosition,
            startingPosition: ['e', 8] as BoardPosition,
            destinationPosition: ['f', 8] as BoardPosition,
            targetStartingPosition: ['a', 8] as BoardPosition,
            expected: false
        },
        {
            color: 'white' as PlayerColor,
            origin: ['e', 1] as BoardPosition,
            destination: ['c', 1] as BoardPosition,
            targetOrigin: ['a', 1] as BoardPosition,
            targetDestination: ['d', 1] as BoardPosition,
            startingPosition: ['e', 1] as BoardPosition,
            destinationPosition: ['c', 1] as BoardPosition,
            targetStartingPosition: ['b', 1] as BoardPosition,
            expected: false
        },
        {
            color: 'black' as PlayerColor,
            origin: ['e', 8] as BoardPosition,
            destination: ['c', 8] as BoardPosition,
            targetOrigin: ['a', 8] as BoardPosition,
            targetDestination: ['d', 8] as BoardPosition,
            startingPosition: ['e', 8] as BoardPosition,
            destinationPosition: ['c', 8] as BoardPosition,
            targetStartingPosition: ['b', 7] as BoardPosition,
            expected: false
        },
        {
            color: 'white' as PlayerColor,
            origin: ['e', 2] as BoardPosition,
            destination: ['g', 1] as BoardPosition,
            targetOrigin: ['h', 1] as BoardPosition,
            targetDestination: ['f', 1] as BoardPosition,
            startingPosition: ['e', 2] as BoardPosition,
            destinationPosition: ['g', 1] as BoardPosition,
            targetStartingPosition: ['h', 1] as BoardPosition,
            expected: false
        },
        {
            color: 'black' as PlayerColor,
            origin: ['e', 8] as BoardPosition,
            destination: ['g', 8] as BoardPosition,
            targetOrigin: ['h', 7] as BoardPosition,
            targetDestination: ['f', 8] as BoardPosition,
            startingPosition: ['e', 8] as BoardPosition,
            destinationPosition: ['g', 8] as BoardPosition,
            targetStartingPosition: ['h', 7] as BoardPosition,
            expected: false
        },
        {
            color: 'white' as PlayerColor,
            origin: ['e', 4] as BoardPosition,
            destination: ['c', 2] as BoardPosition,
            targetOrigin: ['b', 1] as BoardPosition,
            targetDestination: ['d', 3] as BoardPosition,
            startingPosition: ['e', 4] as BoardPosition,
            destinationPosition: ['c', 2] as BoardPosition,
            targetStartingPosition: ['b', 1] as BoardPosition,
            expected: true
        },
        {
            color: 'black' as PlayerColor,
            origin: ['c', 2] as BoardPosition,
            destination: ['c', 8] as BoardPosition,
            targetOrigin: ['c', 8] as BoardPosition,
            targetDestination: ['c', 2] as BoardPosition,
            startingPosition: ['c', 2] as BoardPosition,
            destinationPosition: ['c', 8] as BoardPosition,
            targetStartingPosition: ['c', 8] as BoardPosition,
            expected: true
        }
    ])(
        'Castle move test %#',
        ({
            color,
            origin,
            destination,
            targetOrigin,
            targetDestination,
            startingPosition,
            destinationPosition,
            targetStartingPosition,
            expected
        }: {
            color: PlayerColor;
            origin: BoardPosition;
            destination: BoardPosition;
            targetOrigin: BoardPosition;
            targetDestination: BoardPosition;
            startingPosition: BoardPosition;
            destinationPosition: BoardPosition;
            targetStartingPosition: BoardPosition;
            expected: boolean;
        }) => {
            const moveConfig: CastleMove<testPieceNames> = {
                name: 'castleMove',
                captureAvailability: 'forbidden',
                type: 'castle',
                configForColor: {
                    [color]: {
                        origin: origin,
                        destination: destination,
                        targetPieceName: 'rook',
                        targetPieceOrigin: targetOrigin,
                        targetPieceDestination: targetDestination
                    }
                }
            };

            generateMoveTest(
                moveConfig,
                color,
                startingPosition,
                destinationPosition,
                expected,
                {
                    targetPiecePosition: targetStartingPosition
                }
            );
        }
    );
});

function generateMoveTest(
    moveConfig: CastleMove<testPieceNames>,
    playerColor: PlayerColor,
    startingPosition: BoardPosition,
    destinationPosition: BoardPosition,
    expected: boolean,
    testOptions?: {
        targetPiecePosition?: BoardPosition;
        sameColorStartingPositions?: BoardPosition[];
        otherColorStartingPositions?: BoardPosition[];
        pieceMoves?: number;
    }
) {
    const pieces: PieceConfig<testPieceNames>[] = [];

    pieces.push({
        name: 'king',
        notation: 'K',
        displayCharacters: {
            white: '♔',
            black: '♚'
        },
        moves: [moveConfig],
        startingPositions: {
            [playerColor]: [startingPosition]
        }
    });

    if (testOptions?.targetPiecePosition) {
        pieces.push({
            name: 'rook',
            notation: 'R',
            displayCharacters: {
                white: '♖',
                black: '♜'
            },
            moves: [],
            startingPositions: {
                [playerColor]: [testOptions.targetPiecePosition]
            }
        });
    }

    if (
        testOptions?.sameColorStartingPositions ||
        testOptions?.otherColorStartingPositions
    ) {
        const otherColor: PlayerColor =
            playerColor === 'white' ? 'black' : 'white';

        pieces.push({
            name: 'foo',
            notation: 'F',
            displayCharacters: {
                white: 'F',
                black: 'f'
            },
            moves: [],
            startingPositions: {
                [playerColor]: testOptions?.sameColorStartingPositions
                    ? [...testOptions.sameColorStartingPositions]
                    : [],
                [otherColor]: testOptions?.otherColorStartingPositions
                    ? [...testOptions.otherColorStartingPositions]
                    : []
            }
        });
    }

    const rulesConfig: GameRules<testPieceNames> = {
        name: 'test',
        board: { width: 8, height: 8 },
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
        pieces: pieces
    };

    const engine = new GameEngine(rulesConfig);
    const board = engine.board;
    const piece = board.getSpace(startingPosition).piece!;

    if (testOptions?.pieceMoves) {
        for (let i = 0; i < testOptions.pieceMoves; i++) {
            piece.increaseMoveCount();
        }
    }

    const verifyMoveFunctions = generateVerifyCastleMoveFunctions(moveConfig);
    expect(verifyMoveFunctions).toHaveLength(1);
    const moveFunction = verifyMoveFunctions[0];

    const result = moveFunction(
        board,
        piece,
        startingPosition,
        destinationPosition,
        {
            type: 'castle'
        }
    );

    if (expected) {
        expect(result).toEqual({
            destinationSpace: destinationPosition,
            originSpace: startingPosition,
            moveName: moveConfig.name,
            pieceColor: playerColor,
            pieceName: 'king',
            type: 'castle',
            castleTarget: {
                pieceName:
                    moveConfig.configForColor[playerColor]?.targetPieceName,
                originSpace:
                    moveConfig.configForColor[playerColor]?.targetPieceOrigin,
                destinationSpace:
                    moveConfig.configForColor[playerColor]
                        ?.targetPieceDestination
            }
        });
    } else {
        expect(result).toEqual(false);
    }
}
