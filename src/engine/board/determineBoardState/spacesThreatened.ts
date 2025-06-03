import { BoardPosition, PlayerColor } from '../../../types';
import { RectangularBoard } from '../rectangularBoard';

export function areSpacesThreatened<PieceNames extends string[]>(
    spaces: BoardPosition[],
    board: RectangularBoard<PieceNames>,
    defendingPlayer: PlayerColor
): boolean {
    const threatenedSpaces = getAllThreatenedSpaces(board, defendingPlayer);

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
    board: RectangularBoard<PieceNames>,
    defendingPlayer: PlayerColor
): BoardPosition[] {
    const pieceSpaces = board.getPieceSpaces({ notColor: defendingPlayer });
    const threatenedSpaces: BoardPosition[] = [];

    for (const pieceSpace of pieceSpaces) {
        if (!pieceSpace.piece) {
            //shouldn't happen, but putting this check just in case
            continue;
        }

        const moves = pieceSpace.piece.getLegalMoves(
            board,
            pieceSpace.position
        );

        threatenedSpaces.push(...moves.spacesThreatened);
    }

    return threatenedSpaces;
}
