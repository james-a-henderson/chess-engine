import {
    emptyVerifyMovesFunction,
    Move,
    verifyLegalMoveFunction,
    verifyLegalMoveFunctionV2
} from '../../../../types';
import { generateVerifyCastleMoveFunctions } from './castleMove';
import { generateVerifyJumpMoveFunctions } from './jumpMove';
import { generateVerifyJumpMoveFunctionV2 } from './jumpMoveV2';
import { generateVerifyStandardMoveFunctions } from './standardMove';
import { generateVerifyStandardMoveFunctionV2 } from './standardMoveV2';

export function generateVerifyLegalMoveFunction<PieceNames extends string[]>(
    move: Move<PieceNames>
): verifyLegalMoveFunction<PieceNames> {
    switch (move.type) {
        case 'standard':
            return generateVerifyStandardMoveFunctions(move);
        case 'jump':
            return generateVerifyJumpMoveFunctions(move);
        case 'castle':
            return generateVerifyCastleMoveFunctions(move);
        default:
            return emptyVerifyMovesFunction;
    }
}

export function generateVerifyLegalMoveFunctionV2<PieceNames extends string[]>(
    pieceName: PieceNames[keyof PieceNames],
    move: Move<PieceNames>
): verifyLegalMoveFunctionV2<PieceNames> {
    switch (move.type) {
        case 'standard':
            return generateVerifyStandardMoveFunctionV2(pieceName, move);
        case 'jump':
            return generateVerifyJumpMoveFunctionV2(pieceName, move);
        case 'castle':
        default:
            return emptyVerifyMovesFunction;
    }
}
