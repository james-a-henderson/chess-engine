import {
    GetLegalMovesFunction,
    Move,
    RectangularBoardConfig
} from '../../../../types';
import { generateGetLegalJumpMovesFunction } from './jumpMove';
import { generateGetLegalStandardMovesFunction } from './standardMove';

export function generateGetLegalMoveFunctions<PieceNames extends string[]>(
    move: Move<PieceNames>,
    boardConfig: RectangularBoardConfig
): GetLegalMovesFunction<PieceNames> {
    switch (move.type) {
        case 'standard':
            return generateGetLegalStandardMovesFunction(move, boardConfig);
        case 'jump':
            return generateGetLegalJumpMovesFunction(move);
        default:
            //todo: implement other move types
            return () => {
                return { moves: [], captureMoves: [], spacesThreatened: [] };
            };
    }
}
