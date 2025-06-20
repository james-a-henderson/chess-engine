import {
    BoardPosition,
    Direction,
    MoveConditionFunction,
    MoveRecord
} from '../../../../types';
import { RectangularBoard } from '../../../board';
import { Piece } from '../../piece';
import { calculateMoveLength, determineMoveDirection } from '../helpers';

export function generateSpecificPreviousMoveFunction<
    PieceNames extends string[]
>(
    previousMoveName: string,
    pieceLocations: { direction: Direction; numSpaces: number }[]
): MoveConditionFunction<PieceNames> {
    return (
        piece: Piece<PieceNames>,
        board: RectangularBoard<PieceNames>,
        piecePosition: BoardPosition,
        previousMove?: MoveRecord<PieceNames>
    ) => {
        if (!previousMove || previousMove.moveName !== previousMoveName) {
            return false;
        }

        if (pieceLocations.length === 0) {
            //if no locations is configured, then relation to current piece is irrelevent
            return true;
        }

        const [pieceFileIndex, pieceRankIndex] =
            board.coordinatesToIndicies(piecePosition);
        const [previousPieceFileIndex, previousPieceRankIndex] =
            board.coordinatesToIndicies(previousMove.destinationSpace);

        const direction = determineMoveDirection(
            pieceFileIndex,
            pieceRankIndex,
            previousPieceFileIndex,
            previousPieceRankIndex,
            piece.playerColor
        );

        if (direction === 'invalid') {
            return false;
        }

        const numSpaces = calculateMoveLength(
            direction,
            pieceFileIndex,
            pieceRankIndex,
            previousPieceFileIndex,
            previousPieceRankIndex
        );

        for (const pieceLocation of pieceLocations) {
            if (
                pieceLocation.direction === direction &&
                pieceLocation.numSpaces === numSpaces
            ) {
                return true;
            }
        }

        return false;
    };
}
