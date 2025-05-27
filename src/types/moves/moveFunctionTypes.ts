import { GameEngine } from '../../engine';
import { Piece } from '../../engine/piece';
import { BoardPosition } from '../common';

export type verifyLegalMoveFunction<PieceNames extends string[]> = (
    engine: GameEngine<PieceNames>,
    piece: Piece<PieceNames>,
    destination: BoardPosition
) => boolean;

export type moveConditionFunction<PieceNames extends string[]> = (
    piece: Piece<PieceNames>,
    engine: GameEngine<PieceNames>
) => boolean;
