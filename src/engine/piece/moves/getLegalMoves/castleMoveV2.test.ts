import {
    AvailableMoves,
    BoardPosition,
    CastleMove,
    MoveRecord,
    MoveRecordCastle,
    RectangularBoardConfig,
    RulesConfigurationError
} from '../../../../types';
import { GameStatePiecePlacement } from '../../../gameState';
import { generateGameState } from '../../../gameState/generateGameState';
import { generateGetLegalCastleMovesFunctionV2 } from './castleMoveV2';

type testPieceNames = ['foo', 'bar'];

const generateVerifyLegalMoveFunctionMock = jest.fn();

jest.mock('../verifyMove', () => {
    return {
        generateVerifyLegalMoveFunctionV2: () =>
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
    generateVerifyLegalMoveFunctionMock.mockReturnValue(() => {
        return verifyMoveReturnValue;
    });

    const piecePlacements: GameStatePiecePlacement<testPieceNames>[] = [
        {
            piece: { name: 'foo', color: 'white', moveCount: 0 },
            position: startingPosition
        }
    ];

    const state = generateGameState(piecePlacements, 'white', boardConfig);

    const getMoveFunction = generateGetLegalCastleMovesFunctionV2(
        'foo',
        moveConfig
    );

    return getMoveFunction(state, startingPosition, {});
}
