import {
    LegalMovesForPiece,
    PlayerColor,
    VerifyBoardStateFunction,
    VerifyMovesForPiece
} from '../../types';
import { GameState } from '../gameState';
import { pieceIsInCheck } from './determineBoardState';

export function generateCheckFunction<PieceNames extends string[]>(
    pieceName: PieceNames[keyof PieceNames]
): VerifyBoardStateFunction<PieceNames> {
    return (
        state: GameState<PieceNames>,
        verifyFunctions: VerifyMovesForPiece<PieceNames>,
        getMovesFunctions: LegalMovesForPiece<PieceNames>,
        currentPlayer: PlayerColor
    ) => {
        //function returns true if piece is in check. But since moving into check makes the resulting position invalid, we need to return false
        return !pieceIsInCheck(
            state,
            verifyFunctions,
            getMovesFunctions,
            pieceName,
            currentPlayer
        );
    };
}
