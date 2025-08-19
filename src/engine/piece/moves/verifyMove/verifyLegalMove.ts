import {
    emptyVerifyMovesFunction,
    Move,
    verifyLegalMoveFunctionV2
} from '../../../../types';
import { generateVerifyCastleMoveFunctionV2 } from './castleMoveV2';
import { generateVerifyJumpMoveFunctionV2 } from './jumpMoveV2';
import { generateVerifyStandardMoveFunctionV2 } from './standardMoveV2';

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
            return generateVerifyCastleMoveFunctionV2(pieceName, move);
        default:
            return emptyVerifyMovesFunction;
    }
}
