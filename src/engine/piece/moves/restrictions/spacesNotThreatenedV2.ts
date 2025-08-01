import {
    BoardPosition,
    LegalMovesForPiece,
    MoveConditionFunctionV2,
    PlayerColor,
    RulesConfigurationError
} from '../../../../types';
import { rectangularBoardHelper } from '../../../board';
import { GameState } from '../../../gameState';

export function generateSpacesNotThreatenedFunctionV2<
    PieceNames extends string[]
>(
    spacesForColor: Partial<Record<PlayerColor, BoardPosition[]>>
): MoveConditionFunctionV2<PieceNames> {
    return (
        state: GameState<PieceNames>,
        props: { getLegalMovesFunctions: LegalMovesForPiece<PieceNames> }
    ) => {
        const spaces = spacesForColor[state.currentPlayer];

        if (!spaces) {
            throw new RulesConfigurationError(
                `Invalid configuration for "spacesNotThretened" rule: missing configuration for color ${String(state.currentPlayer)}`
            );
        }

        return !areSpacesThreatened(
            state,
            spaces,
            props.getLegalMovesFunctions
        );
    };
}

function areSpacesThreatened<PieceNames extends string[]>(
    state: GameState<PieceNames>,
    spaces: BoardPosition[],
    getLegalMovesFunctions: LegalMovesForPiece<PieceNames>
): boolean {
    const threatenedSpaces = getAllThreatenedSpaces(
        state,
        getLegalMovesFunctions
    );

    for (const space of threatenedSpaces) {
        const index = spaces.findIndex(
            (s: BoardPosition) => s[0] === space[0] && s[1] === space[1]
        );

        if (index !== -1) {
            return true;
        }
    }

    return false;
}

function getAllThreatenedSpaces<PieceNames extends string[]>(
    state: GameState<PieceNames>,
    getLegalMovesFunctions: LegalMovesForPiece<PieceNames>
): BoardPosition[] {
    const pieceSpaces = rectangularBoardHelper.getPieceSpaces(state, {
        notColor: state.currentPlayer
    });
    const threatenedSpaces: BoardPosition[] = [];

    for (const pieceSpace of pieceSpaces) {
        if (!pieceSpace.piece) {
            //shouln't happen, but putting this check just in case
            continue;
        }

        const moveFunctions =
            getLegalMovesFunctions[String(pieceSpace.piece.name)];

        if (!moveFunctions) {
            continue;
        }

        for (const func of moveFunctions) {
            const moves = func(
                state,
                pieceSpace.position,
                getLegalMovesFunctions
            );

            threatenedSpaces.push(...moves.spacesThreatened);
        }
    }

    return threatenedSpaces;
}
