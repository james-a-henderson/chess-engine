import { DetermineWinnerFunction } from '../../types';
import { GameState } from '../gameState';

export function generateDetermineCheckmateFunction<PieceNames extends string[]>(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    checkmatePiece: PieceNames[keyof PieceNames]
): DetermineWinnerFunction<PieceNames> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return (state: GameState<PieceNames>) => {
        //todo: complete function
        return { status: 'inProgress' };
    };
}
