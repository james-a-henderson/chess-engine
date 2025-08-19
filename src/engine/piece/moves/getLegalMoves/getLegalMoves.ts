import {
    emptyGetMovesFunction,
    GetLegalMovesFunctionV2,
    Move
} from '../../../../types';
import { generateGetLegalCastleMovesFunctionV2 } from './castleMoveV2';
import { generateGetLegalJumpMovesFunctionV2 } from './jumpMoveV2';
import { generateGetLegalStandardMovesFunctionV2 } from './standardMoveV2';

export function generateGetLegalMovesFunctionV2<PieceNames extends string[]>(
    pieceName: PieceNames[keyof PieceNames],
    move: Move<PieceNames>
): GetLegalMovesFunctionV2<PieceNames> {
    switch (move.type) {
        case 'standard':
            return generateGetLegalStandardMovesFunctionV2(move);
        case 'jump':
            return generateGetLegalJumpMovesFunctionV2(move);
        case 'castle':
            return generateGetLegalCastleMovesFunctionV2(pieceName, move);
        default:
            return emptyGetMovesFunction;
    }
}
