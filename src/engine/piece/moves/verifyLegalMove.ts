import {
    Move,
    PlayerColor,
    RectangularBoard,
    verifyLegalMoveFunction
} from '../../../types';
import { generateVerifyStandardMoveFunctions } from './standardMove';

export function generateVerifyLegalMoveFunctions<PieceNames extends string[]>(
    move: Move<PieceNames>,
    color: PlayerColor,
    boardConfig: RectangularBoard
): verifyLegalMoveFunction<PieceNames>[] {
    switch (move.type) {
        case 'standard':
            return generateVerifyStandardMoveFunctions(
                move,
                color,
                boardConfig
            );
        default:
            return [];
    }
}
