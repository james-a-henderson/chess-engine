import {
    AvailableMoves,
    BoardPosition,
    CastleMove,
    GetLegalMovesFunction,
    LegalMovesForPiece,
    MoveRecord,
    RulesConfigurationError
} from '../../../../types';
import { GameState } from '../../../gameState';
import { generateVerifyLegalMoveFunction } from '../verifyMove';

export function generateGetLegalCastleMovesFunction<
    PieceNames extends string[]
>(
    pieceName: PieceNames[keyof PieceNames],
    move: CastleMove<PieceNames>
): GetLegalMovesFunction<PieceNames> {
    //since there's only one possible move for each castle move, we can lean on the verify move code
    const verifyCastleMoveFunction = generateVerifyLegalMoveFunction(
        pieceName,
        move
    );

    return (
        state: GameState<PieceNames>,
        origin: BoardPosition,
        getLegalMovesFunctions: LegalMovesForPiece<PieceNames>,
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
            getLegalMovesFunctions,
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
