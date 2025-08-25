import { GameState, GameStatusInProgress, GameStatusWin } from './gameState';

export type DetermineWinnerFunction<PieceNames extends string[]> = (
    state: GameState<PieceNames>
) => GameStatusWin | GameStatusInProgress;
