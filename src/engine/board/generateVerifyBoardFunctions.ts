import { PlayerColor, VerifyBoardStateFunction } from '../../types';
import { pieceIsInCheck } from './determineBoardState';
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
