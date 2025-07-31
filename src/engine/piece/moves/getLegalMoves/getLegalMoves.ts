import {
    emptyGetMovesFunction,
    GetLegalMovesFunction,
    GetLegalMovesFunctionV2,
    Move
} from '../../../../types';
import { generateGetLegalCastleMovesFunction } from './castleMove';
import { generateGetLegalCastleMovesFunctionV2 } from './castleMoveV2';
import { generateGetLegalJumpMovesFunction } from './jumpMove';
import { generateGetLegalJumpMovesFunctionV2 } from './jumpMoveV2';
import { generateGetLegalStandardMovesFunction } from './standardMove';
import { generateGetLegalStandardMovesFunctionV2 } from './standardMoveV2';

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
