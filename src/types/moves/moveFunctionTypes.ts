import { GameEngine } from '../../engine';
import { Piece } from '../../engine/piece';
import { BoardPosition } from '../common';

export type verifyLegalMoveFunction<PieceNames extends string[]> = (
    engine: GameEngine<PieceNames>,
    piece: Piece<PieceNames>,
    destination: BoardPosition
) => boolean;
