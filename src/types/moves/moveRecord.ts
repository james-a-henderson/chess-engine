import { BoardPosition } from '../common';
import { PlayerColor } from '../configuration';

type MoveRecordBase<PieceNames extends string[]> = {
    moveName: string;
    type: string;
    pieceName: PieceNames[keyof PieceNames];
    pieceColor: PlayerColor;
    destinationSpace: BoardPosition;
    originSpace: BoardPosition;
    promotedTo?: PieceNames[keyof PieceNames];
    altCaptureLocation?: BoardPosition;
};

export type MoveRecordStandard<PieceNames extends string[]> =
    MoveRecordBase<PieceNames> & {
        type: 'standard';
    };

export type MoveRecordJump<PieceNames extends string[]> =
    MoveRecordBase<PieceNames> & {
        type: 'jump';
    };

export type MoveRecordCastle<PieceNames extends string[]> =
    MoveRecordBase<PieceNames> & {
        type: 'castle';
        castleTarget: {
            pieceName: PieceNames[keyof PieceNames];
            originSpace: BoardPosition;
            destinationSpace: BoardPosition;
        };
    };

export type MoveRecord<PieceNames extends string[]> =
    | MoveRecordStandard<PieceNames>
    | MoveRecordJump<PieceNames>
    | MoveRecordCastle<PieceNames>;
