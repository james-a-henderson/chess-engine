import {
    BoardPosition,
    MoveConditionFunction,
    PlayerColor,
    RulesConfigurationError
} from '../../../../types';
import { rectangularBoardHelper } from '../../../board';
import { GameState } from '../../../gameState';

export function generateOtherPieceHasNotMovedFunction<
    PieceNames extends string[]
>(
    pieceName: PieceNames[keyof PieceNames],
    piecePositionForColor: Partial<Record<PlayerColor, BoardPosition>>
): MoveConditionFunction<PieceNames> {
    return (state: GameState<PieceNames>) => {
        const position = piecePositionForColor[state.currentPlayer];

        if (!position) {
            throw new RulesConfigurationError(
                `OtherPieceHasNotMoved improperly configured for player color ${state.currentPlayer}`
            );
        }

        const space = rectangularBoardHelper.getSpace(state, position);

        if (
            !space.piece ||
            space.piece.color !== state.currentPlayer ||
            space.piece.name !== pieceName ||
            space.piece.moveCount > 0
        ) {
            return false;
        }

        return true;
    };
}
