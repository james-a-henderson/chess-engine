import { GameState } from '../../engine/gameState';
import { PlayerColor } from '../configuration';
import { LegalMovesForPiece, VerifyMovesForPiece } from '../moves';

export type VerifyBoardStateFunction<PieceNames extends string[]> = (
    state: GameState<PieceNames>,
    verifyFunctions: VerifyMovesForPiece<PieceNames>,
    getMovesfunctions: LegalMovesForPiece<PieceNames>,
    currentPlayer: PlayerColor
) => boolean;
