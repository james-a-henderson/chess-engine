import { Piece } from '../../engine/piece';
import { BoardPosition } from '../common';

export type BoardSpace<PieceNames extends string[]> = {
    position: BoardPosition;
    piece?: Piece<PieceNames>;
};

export type Board<PieceNames extends string[]> = BoardSpace<PieceNames>[][];
