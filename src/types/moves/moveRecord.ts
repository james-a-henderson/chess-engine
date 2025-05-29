import { BoardPosition } from '../common';
import { PlayerColor } from '../configuration';

export type MoveRecord<PieceNames extends string[]> = {
    destinationSpace: BoardPosition;
    originSpace: BoardPosition;
    pieceName: PieceNames[keyof PieceNames];
    pieceColor: PlayerColor;
    moveName: string;
};
