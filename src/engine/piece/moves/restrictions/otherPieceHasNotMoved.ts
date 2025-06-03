import {
    BoardPosition,
    moveConditionFunction,
    PlayerColor,
    RulesConfigurationError
} from '../../../../types';
import { RectangularBoard } from '../../../board';
import { Piece } from '../../piece';

export function generateOtherPieceHasNotMovedFunction<
    PieceNames extends string[]
>(
    pieceName: PieceNames[keyof PieceNames],
    piecePositionForColor: Partial<Record<PlayerColor, BoardPosition>>
): moveConditionFunction<PieceNames> {
    return (piece: Piece<PieceNames>, board: RectangularBoard<PieceNames>) => {
        const color = piece.playerColor;
        const position = piecePositionForColor[color];

        if (!position) {
            throw new RulesConfigurationError(
                `OtherPieceHasNotMoved improperly configured for player color ${color}`
            );
        }

        const space = board.getSpace(position);

        if (
            !space.piece ||
            space.piece.playerColor !== color ||
            space.piece.pieceName !== pieceName ||
            space.piece.moveCount > 0
        ) {
            return false;
        }

        return true;
    };
}
