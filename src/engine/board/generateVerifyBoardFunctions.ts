import {
    LegalMovesForPiece,
    PlayerColor,
    VerifyBoardStateFunctionV2,
    VerifyMovesForPiece
} from '../../types';
import { GameState } from '../gameState';
import { pieceIsInCheckV2 } from './determineBoardState';

export function generateCheckFunctionV2<PieceNames extends string[]>(
    pieceName: PieceNames[keyof PieceNames]
): VerifyBoardStateFunctionV2<PieceNames> {
    return (
        state: GameState<PieceNames>,
        verifyFunctions: VerifyMovesForPiece<PieceNames>,
        getMovesFunctions: LegalMovesForPiece<PieceNames>,
        currentPlayer: PlayerColor
    ) => {
        //function returns true if piece is in check. But since moving into check makes the resulting position invalid, we need to return false
        return !pieceIsInCheckV2(
            state,
            verifyFunctions,
            getMovesFunctions,
            pieceName,
            currentPlayer
        );
    };
}
