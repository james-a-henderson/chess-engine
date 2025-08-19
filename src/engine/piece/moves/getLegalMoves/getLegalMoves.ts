import {
    emptyGetMovesFunction,
    GetLegalMovesFunction,
    Move
} from '../../../../types';
import { generateGetLegalCastleMovesFunction } from './castleMove';
import { generateGetLegalJumpMovesFunction } from './jumpMove';
import { generateGetLegalStandardMovesFunction } from './standardMove';

export function generateGetLegalMovesFunction<PieceNames extends string[]>(
    pieceName: PieceNames[keyof PieceNames],
    move: Move<PieceNames>
): GetLegalMovesFunction<PieceNames> {
    switch (move.type) {
        case 'standard':
            return generateGetLegalStandardMovesFunction(move);
        case 'jump':
            return generateGetLegalJumpMovesFunction(move);
        case 'castle':
            return generateGetLegalCastleMovesFunction(pieceName, move);
        default:
            return emptyGetMovesFunction;
    }
}
