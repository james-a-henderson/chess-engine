import { Piece } from '../../piece';

export function firstPieceMove<PieceNames extends string[]>(
    piece: Piece<PieceNames>
): boolean {
    return piece.moveCount === 0;
}
