import { DetermineWinnerFunction, WinCondition } from '../../types';
import { allPlayerPiecesCaptured } from './captureAllPieces';
import { generateDetermineCheckmateFunction } from './checkmate';

export function generateDetermineWinnerFunctions<PieceNames extends string[]>(
    conditions: WinCondition<PieceNames>[]
): DetermineWinnerFunction<PieceNames>[] {
    const funcs: DetermineWinnerFunction<PieceNames>[] = [];

    for (const condition of conditions) {
        switch (condition.condition) {
            case 'captureAllPieces':
                funcs.push(allPlayerPiecesCaptured);
                break;
            case 'checkmate':
                funcs.push(
                    generateDetermineCheckmateFunction(condition.checkmatePiece)
                );
                break;
            case 'resign':
                //todo: remove the resign win condition
                //I'll be changing resign to being a special case. However the resign condition is used in some unit tests, which still need to be updated
                funcs.push(() => {
                    return false;
                });
                break;
        }
    }

    return funcs;
}
