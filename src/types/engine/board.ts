import { RectangularBoard } from '../../engine/board';
import { GameState } from '../../engine/gameState';
import { Piece } from '../../engine/piece';
import { BoardPosition } from '../common';
import { PlayerColor } from '../configuration';
import { LegalMovesForPiece, VerifyMovesForPiece } from '../moves';

export type BoardSpace<PieceNames extends string[]> = {
    position: BoardPosition;
    piece?: Piece<PieceNames>;
};

export type PiecePlacement<PieceNames extends string[]> = {
    piece: Piece<PieceNames>;
    position: BoardPosition;
};

export type VerifyBoardStateFunction<PieceNames extends string[]> = (
    board: RectangularBoard<PieceNames>,
    currentPlayer: PlayerColor
) => boolean;

export type VerifyBoardStateFunctionV2<PieceNames extends string[]> = (
    state: GameState<PieceNames>,
    verifyFunctions: VerifyMovesForPiece<PieceNames>,
    getMovesfunctions: LegalMovesForPiece<PieceNames>,
    currentPlayer: PlayerColor
) => boolean;
