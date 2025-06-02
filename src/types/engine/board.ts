import { RectangularBoard } from '../../engine/board';
import { Piece } from '../../engine/piece';
import { BoardPosition } from '../common';

export type BoardSpace<PieceNames extends string[]> = {
    position: BoardPosition;
    piece?: Piece<PieceNames>;
};

export type PiecePlacement<PieceNames extends string[]> = {
    piece: Piece<PieceNames>;
    position: BoardPosition;
};

export type verifyBoardStateFunction<PieceNames extends string[]> = (
    board: RectangularBoard<PieceNames>
) => boolean;