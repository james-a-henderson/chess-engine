import {
    AvailableMoves,
    BoardPosition,
    CastleMove,
    GameRules,
    MoveRecord,
    MoveRecordCastle,
    PieceConfig,
    RectangularBoardConfig,
    RulesConfigurationError
} from '../../../../types';
import { GameEngine } from '../../../GameEngine';
import { generateGetLegalCastleMovesFunction } from './castleMove';

type testPieceNames = ['foo', 'bar'];

const generateVerifyLegalMoveFunctionMock = jest.fn();

jest.mock('../verifyMove', () => {
    return {
        generateVerifyLegalMoveFunction: () =>
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            generateVerifyLegalMoveFunctionMock()
    };
});

const castleMoveRecord: MoveRecordCastle<testPieceNames> = {
    type: 'castle',
    moveName: 'kingsideCastle',
    destinationSpace: ['g', 1],
    pieceName: 'foo',
    pieceColor: 'white',
    originSpace: ['e', 1],
    castleTarget: {
        pieceName: 'bar',
        originSpace: ['h', 1],
        destinationSpace: ['f', 1]
    }
};

const boardConfig: RectangularBoardConfig = {
    width: 8,
    height: 8
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

const baseMoveConfig: CastleMove<testPieceNames> = {
    type: 'castle',
    name: 'kingsideCastle',
    captureAvailability: 'forbidden',
    configForColor: {
        white: {
            origin: ['e', 1],
            destination: ['g', 1],
            targetPieceName: 'bar',
            targetPieceOrigin: ['h', 1],
            targetPieceDestination: ['f', 1]
        }
    }
};

describe('generateGetLegalCastleMovesFunction', () => {
    beforeEach(() => {
        generateVerifyLegalMoveFunctionMock.mockReset();
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    test('returns expected move when verifyCastleMove returns record', () => {
        const result = getTestResult(
            baseMoveConfig,
            ['e', 1],
            castleMoveRecord
        );

        expect(result).toEqual({
            moves: [],
            captureMoves: [],
            spacesThreatened: [],
            specialMoves: [
                {
                    type: 'castle',
                    destination: ['g', 1]
                }
            ]
        });
    });

    test('returns no moves when verifyCastleMove returns false', () => {
        const result = getTestResult(baseMoveConfig, ['e', 1], false);

        expect(result).toEqual({
            moves: [],
            captureMoves: [],
            spacesThreatened: [],
            specialMoves: []
        });
    });

    test('returns correct threatened spaces when captureAvailability is optional', () => {
        const moveConfig: CastleMove<testPieceNames> = {
            ...baseMoveConfig,
            captureAvailability: 'optional'
        };

        const result = getTestResult(moveConfig, ['e', 1], castleMoveRecord);

        expect(result.spacesThreatened).toEqual([['g', 1]]);
    });

    test('returns correct threatened spaces when captureAvailability is required', () => {
        const moveConfig: CastleMove<testPieceNames> = {
            ...baseMoveConfig,
            captureAvailability: 'required'
        };

        const result = getTestResult(moveConfig, ['e', 1], castleMoveRecord);

        expect(result.spacesThreatened).toEqual([['g', 1]]);
    });

    test('throws error if castle information not configured for player color', () => {
        const moveConfig: CastleMove<testPieceNames> = {
            ...baseMoveConfig,
            configForColor: {}
        };

        expect(() => {
            getTestResult(moveConfig, ['e', 1], castleMoveRecord);
        }).toThrow(RulesConfigurationError);
    });
});

function getTestResult(
    moveConfig: CastleMove<testPieceNames>,
    startingPosition: BoardPosition,
    verifyMoveReturnValue: MoveRecord<testPieceNames> | false
): AvailableMoves {
    const pieceConfig: PieceConfig<testPieceNames> = {
        name: 'foo',
        displayCharacters: {
            white: 'F',
            black: 'f'
        },
        notation: 'F',
        startingPositions: {
            white: [startingPosition]
        },
        moves: [moveConfig]
    };

    const rulesConfig: GameRules<testPieceNames> = {
        ...baseRulesConfig,
        pieces: [pieceConfig]
    };

    generateVerifyLegalMoveFunctionMock.mockReturnValue(() => {
        return verifyMoveReturnValue;
    });

    const engine = new GameEngine(rulesConfig);
    const board = engine.board;
    const piece = board.getSpace(startingPosition).piece!;

    const getMoveFunction = generateGetLegalCastleMovesFunction(moveConfig);

    return getMoveFunction(board, piece, startingPosition);
}
