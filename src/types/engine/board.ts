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
