import { RectangularBoard } from '../../engine/board/rectangularBoard';
import { Piece } from '../../engine/piece';
import { BoardPosition } from '../common';
import { MoveRecord } from './moveRecord';

export type verifyLegalMoveFunction<PieceNames extends string[]> = (
    board: RectangularBoard<PieceNames>,
    piece: Piece<PieceNames>,
    currentSpace: BoardPosition,
    destination: BoardPosition
) => MoveRecord<PieceNames> | false;

export type AvailableMoves = {
    moves: BoardPosition[];
    captureMoves: BoardPosition[];
    spacesThreatened: BoardPosition[]; //for determining if move causes king to move into check
};

export type getLegalMovesFunction<PieceNames extends string[]> = (
    board: RectangularBoard<PieceNames>,
    piece: Piece<PieceNames>,
    currentSpace: BoardPosition
) => AvailableMoves;

export type moveConditionFunction<PieceNames extends string[]> = (
    piece: Piece<PieceNames>,
    board: RectangularBoard<PieceNames>
) => boolean;
