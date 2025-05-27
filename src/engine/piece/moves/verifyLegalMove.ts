import {
    Move,
    RectangularBoard,
    verifyLegalMoveFunction
} from '../../../types';
import { generateVerifyJumpMoveFunctions } from './jumpMove';
import { generateVerifyStandardMoveFunctions } from './standardMove';

export function generateVerifyLegalMoveFunctions<PieceNames extends string[]>(
    move: Move<PieceNames>,
    boardConfig: RectangularBoard
): verifyLegalMoveFunction<PieceNames>[] {
    switch (move.type) {
        case 'standard':
            return generateVerifyStandardMoveFunctions(move, boardConfig);
        case 'jump':
            return generateVerifyJumpMoveFunctions(move);
        default:
            return [];
    }
}
