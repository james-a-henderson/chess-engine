import {
    emptyVerifyMovesFunction,
    Move,
    verifyLegalMoveFunction
} from '../../../../types';
import { generateVerifyCastleMoveFunction } from './castleMove';
import { generateVerifyJumpMoveFunction } from './jumpMove';
import { generateVerifyStandardMoveFunction } from './standardMove';

export function generateVerifyLegalMoveFunction<PieceNames extends string[]>(
    pieceName: PieceNames[keyof PieceNames],
    move: Move<PieceNames>
): verifyLegalMoveFunction<PieceNames> {
    switch (move.type) {
        case 'standard':
            return generateVerifyStandardMoveFunction(pieceName, move);
        case 'jump':
            return generateVerifyJumpMoveFunction(pieceName, move);
        case 'castle':
            return generateVerifyCastleMoveFunction(pieceName, move);
        default:
            return emptyVerifyMovesFunction;
    }
}
