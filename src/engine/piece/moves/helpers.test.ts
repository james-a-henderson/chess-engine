import {
    BoardPosition,
    CaptureAvailability,
    Direction,
    GameRules,
    MoveCondition,
    PieceConfig,
    PlayerColor,
    RectangularBoard
} from '../../../types';
import { GameEngine } from '../../GameEngine';
import { Piece } from '../piece';
import {
    getMoveConditionFunctions,
    pieceIsOnPosition,
    reverseDirection,
    validateCaptureRules
} from './helpers';
import { firstPieceMove } from './restrictions';

type testPieceNames = ['foo', 'bar'];

const rulesConfig: GameRules<testPieceNames> = {
    name: 'test',
    players: [
        { color: 'white', order: 0 },
        { color: 'black', order: 1 }
    ],
    board: {
        height: 8,
        width: 8
    },
    winConditions: [{ condition: 'resign' }],
    drawConditions: [],
    pieces: []
};

describe('helpers', () => {
    describe('validateCaptureRules', () => {
        describe('required', () => {
            test('returns true if piece is black and destination space contains white piece', () => {
                generateCaptureTest(
                    'required',
                    'black',
                    ['c', 3],
                    ['c', 5],
                    true,
                    true
                );
            });

            test('returns false if piece is black and destination space contains no piece', () => {
                generateCaptureTest(
                    'required',
                    'black',
                    ['c', 3],
                    ['c', 5],
                    false,
                    false
                );
            });

            test('returns true if piece is white and destination space contains black piece', () => {
                generateCaptureTest(
                    'required',
                    'white',
                    ['c', 5],
                    ['c', 3],
                    true,
                    true
                );
            });

            test('returns false if piece is white and destination space contains no piece', () => {
                generateCaptureTest(
                    'required',
                    'white',
                    ['c', 5],
                    ['c', 3],
                    false,
                    false
                );
            });
        });

        describe('optional', () => {
            test('returns true if piece is black and destination space contains white piece', () => {
                generateCaptureTest(
                    'optional',
                    'black',
                    ['c', 3],
                    ['c', 5],
                    true,
                    true
                );
            });

            test('returns true if piece is black and destination space contains no piece', () => {
                generateCaptureTest(
                    'optional',
                    'black',
                    ['c', 3],
                    ['c', 5],
                    false,
                    true
                );
            });

            test('returns true if piece is white and destination space contains black piece', () => {
                generateCaptureTest(
                    'optional',
                    'white',
                    ['c', 5],
                    ['c', 3],
                    true,
                    true
                );
            });

            test('returns true if piece is white and destination space contains no piece', () => {
                generateCaptureTest(
                    'optional',
                    'white',
                    ['c', 5],
                    ['c', 3],
                    false,
                    true
                );
            });
        });

        describe('forbidden', () => {
            test('returns false if piece is black and destination space contains white piece', () => {
                generateCaptureTest(
                    'forbidden',
                    'black',
                    ['c', 3],
                    ['c', 5],
                    true,
                    false
                );
            });

            test('returns true if piece is black and destination space contains no piece', () => {
                generateCaptureTest(
                    'forbidden',
                    'black',
                    ['c', 3],
                    ['c', 5],
                    false,
                    true
                );
            });

            test('returns false if piece is white and destination space contains black piece', () => {
                generateCaptureTest(
                    'forbidden',
                    'white',
                    ['c', 5],
                    ['c', 3],
                    true,
                    false
                );
            });

            test('returns true if piece is white and destination space contains no piece', () => {
                generateCaptureTest(
                    'forbidden',
                    'white',
                    ['c', 5],
                    ['c', 3],
                    false,
                    true
                );
            });
        });
    });

    describe('pieceIsOnPosition', () => {
        test.each([
            {
                pieceFile: 'a',
                pieceRank: 3,
                inputFile: 'a',
                inputRank: 3,
                expected: true
            },
            {
                pieceFile: 'f',
                pieceRank: 4,
                inputFile: 'f',
                inputRank: 4,
                expected: true
            },
            {
                pieceFile: 'h',
                pieceRank: 8,
                inputFile: 'h',
                inputRank: 8,
                expected: true
            },
            {
                pieceFile: 'b',
                pieceRank: 3,
                inputFile: 'c',
                inputRank: 3,
                expected: false
            },
            {
                pieceFile: 'b',
                pieceRank: 3,
                inputFile: 'a',
                inputRank: 3,
                expected: false
            },
            {
                pieceFile: 'a',
                pieceRank: 3,
                inputFile: 'a',
                inputRank: 2,
                expected: false
            },
            {
                pieceFile: 'a',
                pieceRank: 3,
                inputFile: 'a',
                inputRank: 4,
                expected: false
            },
            {
                pieceFile: 'a',
                pieceRank: 1,
                inputFile: 'h',
                inputRank: 8,
                expected: false
            }
        ])(
            'Piece position: $pieceFile$pieceRank Input Position: $inputFile$inputRank expected: $expected',
            ({
                pieceFile,
                pieceRank,
                inputFile,
                inputRank,
                expected
            }: {
                pieceFile: string;
                pieceRank: number;
                inputFile: string;
                inputRank: number;
                expected: boolean;
            }) => {
                const config: PieceConfig<testPieceNames> = {
                    name: 'foo',
                    displayCharacters: {
                        white: 'F',
                        black: 'f'
                    },
                    moves: [],
                    notation: 'F',
                    startingPositions: {
                        white: [[pieceFile, pieceRank]]
                    }
                };

                const board: RectangularBoard = {
                    height: 8,
                    width: 8
                };
                const piece = new Piece(
                    config,
                    'white',
                    [pieceFile, pieceRank],
                    board
                );

                const result = pieceIsOnPosition(piece, [inputFile, inputRank]);
                expect(result).toEqual(expected);
            }
        );
    });

    describe('reverseDirection', () => {
        test.each([
            ['forward', 'backward'],
            ['backward', 'forward'],
            ['left', 'right'],
            ['right', 'left'],
            ['leftForward', 'rightBackward'],
            ['rightForward', 'leftBackward'],
            ['leftBackward', 'rightForward'],
            ['rightBackward', 'leftForward']
        ])('input: %s expected: %s', (input: string, expected: string) => {
            const result = reverseDirection(input as Direction);
            expect(result).toEqual(expected);
        });
    });

    describe('getMoveConditionFunctions', () => {
        test('returns empty array with no conditions', () => {
            const result = getMoveConditionFunctions([]);

            expect(result).toHaveLength(0);
        });

        test('returns firstPieceMove function with ConditionFirstPieceMove input', () => {
            const input = [
                { condition: 'firstPieceMove' }
            ] as MoveCondition<testPieceNames>[];

            const result = getMoveConditionFunctions(input);

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual(firstPieceMove);
        });
    });
});

function generateCaptureTest(
    captureAvailability: CaptureAvailability,
    playerColor: PlayerColor,
    startingPosition: BoardPosition,
    destinationPosition: BoardPosition,
    pieceOnPosition: boolean,
    expected: boolean
) {
    const captureColor: PlayerColor =
        playerColor === 'white' ? 'black' : 'white';
    const pieceConfig: PieceConfig<testPieceNames> = {
        name: 'foo',
        notation: 'P',
        displayCharacters: {
            white: 'P',
            black: 'p'
        },
        moves: [],
        startingPositions: {
            [playerColor]: [startingPosition]
        }
    };

    const capturePieceConfig: PieceConfig<testPieceNames> = {
        name: 'bar',
        displayCharacters: {
            white: 'B',
            black: 'b'
        },
        notation: 'B',
        moves: [],
        startingPositions: {
            [captureColor]: [destinationPosition]
        }
    };
    const config: GameRules<testPieceNames> = {
        ...rulesConfig,
        pieces: pieceOnPosition
            ? [pieceConfig, capturePieceConfig]
            : [pieceConfig]
    };
    const engine = new GameEngine(config);
    const piece = engine.getSpace(startingPosition).piece!;

    const result = validateCaptureRules(
        piece,
        engine,
        destinationPosition,
        captureAvailability
    );

    expect(result).toEqual(expected);
}
