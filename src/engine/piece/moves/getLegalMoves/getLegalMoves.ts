import {
    emptyGetMovesFunction,
    GetLegalMovesFunction,
    Move
} from '../../../../types';
import { generateGetLegalCastleMovesFunction } from './castleMove';
import { generateGetLegalJumpMovesFunction } from './jumpMove';
import { generateGetLegalStandardMovesFunction } from './standardMove';

export function generateGetLegalMoveFunctions<PieceNames extends string[]>(
    move: Move<PieceNames>
): GetLegalMovesFunction<PieceNames> {
    switch (move.type) {
        case 'standard':
            return generateGetLegalStandardMovesFunction(move);
        case 'jump':
            return generateGetLegalJumpMovesFunction(move);
        case 'castle':
            return generateGetLegalCastleMovesFunction(move);
        default:
            //todo: implement other move types
            return emptyGetMovesFunction;
    }
}
