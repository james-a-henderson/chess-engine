import { GameEngine } from '../../engine';
import { Piece } from '../../engine/piece';
import { BoardPosition } from '../common';
import { MoveRecord } from './moveRecord';

export type verifyLegalMoveFunction<PieceNames extends string[]> = (
    engine: GameEngine<PieceNames>,
    piece: Piece<PieceNames>,
    destination: BoardPosition
) => MoveRecord<PieceNames> | false;

export type AvailableMoves = {
    moves: BoardPosition[];
    captureMoves: BoardPosition[];
    spacesThreatened: BoardPosition[]; //for determining if move causes king to move into check
};

export type getLegalMovesFunction<PieceNames extends string[]> = (
    engine: GameEngine<PieceNames>,
    piece: Piece<PieceNames>
) => AvailableMoves;

export type moveConditionFunction<PieceNames extends string[]> = (
    piece: Piece<PieceNames>,
    engine: GameEngine<PieceNames>
) => boolean;
