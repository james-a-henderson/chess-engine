import {
    emptyVerifyMovesFunction,
    Move,
    RectangularBoardConfig,
    verifyLegalMoveFunction
} from '../../../../types';
import { generateVerifyCastleMoveFunctions } from './castleMove';
import { generateVerifyJumpMoveFunctions } from './jumpMove';
import { generateVerifyStandardMoveFunctions } from './standardMove';

export function generateVerifyLegalMoveFunction<PieceNames extends string[]>(
    move: Move<PieceNames>,
    boardConfig: RectangularBoardConfig
): verifyLegalMoveFunction<PieceNames> {
    switch (move.type) {
        case 'standard':
            return generateVerifyStandardMoveFunctions(move, boardConfig);
        case 'jump':
            return generateVerifyJumpMoveFunctions(move);
        case 'castle':
            return generateVerifyCastleMoveFunctions(move);
        default:
            return emptyVerifyMovesFunction;
    }
}
