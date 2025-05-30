import {
    Move,
    RectangularBoardConfig,
    verifyLegalMoveFunction
} from '../../../../types';
import { generateVerifyJumpMoveFunctions } from './jumpMove';
import { generateVerifyStandardMoveFunctions } from './standardMove';

export function generateVerifyLegalMoveFunctions<PieceNames extends string[]>(
    move: Move<PieceNames>,
    boardConfig: RectangularBoardConfig
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
