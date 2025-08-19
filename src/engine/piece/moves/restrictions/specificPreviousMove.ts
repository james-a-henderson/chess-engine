import {
    BoardPosition,
    Direction,
    MoveConditionFunction,
    MoveRecord
} from '../../../../types';
import { rectangularBoardHelper } from '../../../board';
import { GameState } from '../../../gameState';
import { calculateMoveLength, determineMoveDirection } from '../helpers';

export function generateSpecificPreviousMoveFunction<
    PieceNames extends string[]
>(
    previousMoveName: string,
    pieceLocations: { direction: Direction; numSpaces: number }[]
): MoveConditionFunction<PieceNames> {
    return (
        state: GameState<PieceNames>,
        props: {
            piecePosition: BoardPosition;
            previousMove?: MoveRecord<PieceNames>;
        }
    ) => {
        if (
            !props.previousMove ||
            props.previousMove.moveName !== previousMoveName
        ) {
            return false;
        }

        if (pieceLocations.length === 0) {
            //if no locations are configured, then relation to current piece is irrelevent
            return true;
        }

        const [pieceFileIndex, pieceRankIndex] =
            rectangularBoardHelper.coordinatesToIndicies(
                state.boardConfig,
                props.piecePosition
            );
        const [previousPieceFileIndex, previousPieceRankIndex] =
            rectangularBoardHelper.coordinatesToIndicies(
                state.boardConfig,
                props.previousMove.destinationSpace
            );

        const direction = determineMoveDirection(
            pieceFileIndex,
            pieceRankIndex,
            previousPieceFileIndex,
            previousPieceRankIndex,
            state.currentPlayer
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
