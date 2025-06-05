import { RectangularBoard } from '../../engine/board/rectangularBoard';
import { Piece } from '../../engine/piece';
import { BoardPosition } from '../common';
import { MoveRecord } from './moveRecord';

type MoveOptionsBase = {
    type: string;
};

export type CastleMoveOptions = MoveOptionsBase & {
    type: 'castle';
    targetPieceLocation: BoardPosition;
};

export type MoveOptions = CastleMoveOptions; //will expand with promotion options later

export type verifyLegalMoveFunction<PieceNames extends string[]> = (
    board: RectangularBoard<PieceNames>,
    piece: Piece<PieceNames>,
    currentSpace: BoardPosition,
    destination: BoardPosition,
    moveOptions?: MoveOptions
) => MoveRecord<PieceNames> | false;

export type AvailableMoves = {
    moves: BoardPosition[];
    captureMoves: BoardPosition[];
    spacesThreatened: BoardPosition[]; //for determining if move causes king to move into check
};

export type GetLegalMovesFunction<PieceNames extends string[]> = (
    board: RectangularBoard<PieceNames>,
    piece: Piece<PieceNames>,
    currentSpace: BoardPosition
) => AvailableMoves;

export type MoveConditionFunction<PieceNames extends string[]> = (
    piece: Piece<PieceNames>,
    board: RectangularBoard<PieceNames>
) => boolean;
