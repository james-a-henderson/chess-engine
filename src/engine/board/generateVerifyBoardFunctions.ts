import {
    LegalMovesForPiece,
    PlayerColor,
    VerifyBoardStateFunction,
    VerifyBoardStateFunctionV2,
    VerifyMovesForPiece
} from '../../types';
import { GameState } from '../gameState';
import { pieceIsInCheck, pieceIsInCheckV2 } from './determineBoardState';
import { RectangularBoard } from './rectangularBoard';

export function generateCheckFunction<PieceNames extends string[]>(
    pieceName: PieceNames[keyof PieceNames]
): VerifyBoardStateFunction<PieceNames> {
    return (
        board: RectangularBoard<PieceNames>,
        currentPlayer: PlayerColor
    ) => {
        //function returns true if piece is in check. But since moving into check makes the resulting position invalid, we need to return false
        return !pieceIsInCheck(board, pieceName, currentPlayer);
    };
}

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
