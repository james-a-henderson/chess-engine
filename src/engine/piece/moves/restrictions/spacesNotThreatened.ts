import {
    BoardPosition,
    MoveConditionFunction,
    PlayerColor,
    RulesConfigurationError
} from '../../../../types';
import { areSpacesThreatened, RectangularBoard } from '../../../board';
import { Piece } from '../../piece';

export function generateSpacesNotThreatenedFunction<
    PieceNames extends string[]
>(
    spacesForColor: Partial<Record<PlayerColor, BoardPosition[]>>
): MoveConditionFunction<PieceNames> {
    return (piece: Piece<PieceNames>, board: RectangularBoard<PieceNames>) => {
        const color = piece.playerColor;

        if (!spacesForColor[color]) {
            throw new RulesConfigurationError(
                `Invalid configuration for "spacesNotThretened" rule: missing configuration for color ${String(color)}`
            );
        }

        return !areSpacesThreatened(spacesForColor[color], board, color);
    };
}
