import {
    Move,
    RectangularBoard,
    verifyLegalMoveFunction
} from '../../../types';
import { generateVerifyStandardMoveFunctions } from './standardMove';

export function generateVerifyLegalMoveFunctions<PieceNames extends string[]>(
    move: Move<PieceNames>,
    boardConfig: RectangularBoard
): verifyLegalMoveFunction<PieceNames>[] {
    switch (move.type) {
        case 'standard':
            return generateVerifyStandardMoveFunctions(move, boardConfig);
        default:
            return [];
    }
}
