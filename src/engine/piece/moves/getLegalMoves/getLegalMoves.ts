import {
    getLegalMovesFunction,
    Move,
    RectangularBoard
} from '../../../../types';
import { generateGetLegalJumpMovesFunction } from './jumpMove';
import { generateGetLegalStandardMovesFunction } from './standardMove';

export function generateGetLegalMoveFunctions<PieceNames extends string[]>(
    move: Move<PieceNames>,
    boardConfig: RectangularBoard
): getLegalMovesFunction<PieceNames> {
    switch (move.type) {
        case 'standard':
            return generateGetLegalStandardMovesFunction(move, boardConfig);
        case 'jump':
            return generateGetLegalJumpMovesFunction(move);
        default:
            //todo: implement other move types
            return () => {
                return [];
            };
    }
}
