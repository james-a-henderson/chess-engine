import { BoardPosition } from '../../../../types';
import { rectangularBoardHelper } from '../../../board';
import { GameState } from '../../../gameState';

export function firstPieceMoveV2<PieceNames extends string[]>(
    state: GameState<PieceNames>,
    piecePosition: BoardPosition
): boolean {
    const space = rectangularBoardHelper.getSpace(state, piecePosition);
    return space?.piece?.moveCount === 0;
}
