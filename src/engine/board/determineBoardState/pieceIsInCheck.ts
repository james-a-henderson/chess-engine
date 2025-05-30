import { GameError, PlayerColor } from '../../../types';
import { RectangularBoard } from '../rectangularBoard';

export function pieceIsInCheck<PieceNames extends string[]>(
    board: RectangularBoard<PieceNames>,
    pieceName: PieceNames[keyof PieceNames],
    pieceColor: PlayerColor
): boolean {
    const checkPieceSpaceResult = board.getPieceSpaces({
        name: pieceName,
        isColor: pieceColor
    });

    if (checkPieceSpaceResult.length !== 1) {
        throw new GameError(
            `Expected exactly check piece, but found ${checkPieceSpaceResult.length}`
        );
    }

    const checkPiecePosition = checkPieceSpaceResult[0].position;

    const otherPieceSpaces = board.getPieceSpaces({ notColor: pieceColor });

    for (const space of otherPieceSpaces) {
        if (
            space.piece?.verifyMove(board, space.position, checkPiecePosition)
        ) {
            //at least one piece can capture the check piece
            return true;
        }
    }

    return false;
}
