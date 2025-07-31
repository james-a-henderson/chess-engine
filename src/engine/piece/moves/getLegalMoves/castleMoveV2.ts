import {
    AvailableMoves,
    BoardPosition,
    CastleMove,
    GetLegalMovesFunctionV2,
    MoveRecord,
    RulesConfigurationError
} from '../../../../types';
import { GameState } from '../../../gameState';
import { generateVerifyLegalMoveFunctionV2 } from '../verifyMove';

export function generateGetLegalCastleMovesFunctionV2<
    PieceNames extends string[]
>(
    pieceName: PieceNames[keyof PieceNames],
    move: CastleMove<PieceNames>
): GetLegalMovesFunctionV2<PieceNames> {
    //since there's only one possible move for each castle move, we can lean on the verify move code
    const verifyCastleMoveFunction = generateVerifyLegalMoveFunctionV2(
        pieceName,
        move
    );

    return (
        state: GameState<PieceNames>,
        origin: BoardPosition,
        previousMove?: MoveRecord<PieceNames>
    ) => {
        const availableMoves: AvailableMoves = {
            moves: [],
            captureMoves: [],
            spacesThreatened: [],
            specialMoves: []
        };
        const castleDestination =
            move.configForColor[state.currentPlayer]?.destination;

        if (!castleDestination) {
            //todo: catch this during board setup
            throw new RulesConfigurationError(
                'Castle information not configured for player color'
            );
        }

        const verifyResult = verifyCastleMoveFunction(
            state,
            origin,
            castleDestination,
            previousMove
        );

        if (verifyResult) {
            availableMoves.specialMoves?.push({
                type: 'castle',
                destination: castleDestination
            });
        }

        return availableMoves;
    };
}
