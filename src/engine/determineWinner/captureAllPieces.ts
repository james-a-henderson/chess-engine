import { getOtherPlayerColor } from '../../common';
import { rectangularBoardHelper } from '../board';
import { GameState, GameStatusInProgress, GameStatusWin } from '../gameState';

export function allPlayerPiecesCaptured<PieceNames extends string[]>(
    state: GameState<PieceNames>
): GameStatusWin | GameStatusInProgress {
    const pieceSpaces = rectangularBoardHelper.getPieceSpaces(state, {
        isColor: state.currentPlayer
    });

    if (pieceSpaces.length > 0) {
        return { status: 'inProgress' };
    }

    return {
        status: 'victory',
        winningPlayer: getOtherPlayerColor(state.currentPlayer)
    };
}
