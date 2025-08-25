import { getOtherPlayerColor } from '../../common';
import { rectangularBoardHelper } from '../board';
import { GameState, GameStatusWin } from '../gameState';

export function allPlayerPiecesCaptured<PieceNames extends string[]>(
    state: GameState<PieceNames>
): GameStatusWin | false {
    const pieceSpaces = rectangularBoardHelper.getPieceSpaces(state, {
        isColor: state.currentPlayer
    });

    if (pieceSpaces.length > 0) {
        return false;
    }

    return {
        status: 'victory',
        winningPlayer: getOtherPlayerColor(state.currentPlayer)
    };
}
