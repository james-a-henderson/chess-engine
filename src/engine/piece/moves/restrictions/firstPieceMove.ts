import { BoardPosition } from '../../../../types';
import { rectangularBoardHelper } from '../../../board';
import { GameState } from '../../../gameState';

export function firstPieceMove<PieceNames extends string[]>(
    state: GameState<PieceNames>,
    props: { piecePosition: BoardPosition }
): boolean {
    const space = rectangularBoardHelper.getSpace(state, props.piecePosition);
    return space?.piece?.moveCount === 0;
}
