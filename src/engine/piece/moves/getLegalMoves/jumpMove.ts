import {
    CaptureAvailability,
    getLegalMovesFunction,
    InvalidSpaceError,
    JumpMove,
    LegalMove,
    moveConditionFunction
} from '../../../../types';
import { GameEngine } from '../../../GameEngine';
import { Piece } from '../../piece';
import { getMoveConditionFunctions, validateCaptureRules } from '../helpers';

export function generateGetLegalJumpMovesFunction<PieceNames extends string[]>(
    move: JumpMove<PieceNames>
): getLegalMovesFunction<PieceNames> {
    const conditionFunctions = getMoveConditionFunctions(
        move.moveConditions ?? []
    );

    return generateFunction(
        move.captureAvailability,
        move.jumpCoordinates,
        conditionFunctions
    );
}

function generateFunction<PieceNames extends string[]>(
    captureAvailability: CaptureAvailability,
    jumpCoordinates: {
        horizontalSpaces: number;
        verticalSpaces: number;
    }[],
    conditionFunctions: moveConditionFunction<PieceNames>[]
): getLegalMovesFunction<PieceNames> {
    return (engine: GameEngine<PieceNames>, piece: Piece<PieceNames>) => {
        const moves: LegalMove[] = [];

        for (const conditionFunction of conditionFunctions) {
            if (!conditionFunction(piece, engine)) {
                return [];
            }
        }

        const [currentFileIndex, currentRankIndex] =
            engine.coordinatesToIndicies(piece.position);

        for (const coordinate of jumpCoordinates) {
            let horizontalSpaces = coordinate.horizontalSpaces;
            let verticalSpaces = coordinate.verticalSpaces;

            if (piece.playerColor === 'black') {
                //invert coordinates for black
                horizontalSpaces = -horizontalSpaces;
                verticalSpaces = -verticalSpaces;
            }

            const fileIndex = currentFileIndex + horizontalSpaces;
            const rankIndex = currentRankIndex + verticalSpaces;

            try {
                const space = engine.getSpace([fileIndex, rankIndex]);

                if (
                    !validateCaptureRules(
                        piece,
                        engine,
                        space.position,
                        captureAvailability
                    )
                ) {
                    //capture rules make moving to this space illegal
                    continue;
                }

                if (space.piece) {
                    moves.push({
                        position: space.position,
                        captureStatus: 'isCaptureMove'
                    });
                    continue;
                }

                if (captureAvailability === 'optional') {
                    moves.push({
                        position: space.position,
                        captureStatus: 'canCapture'
                    });
                    continue;
                }

                if (captureAvailability === 'forbidden') {
                    moves.push({
                        position: space.position,
                        captureStatus: 'cannotCapture'
                    });
                    continue;
                }

                //other combinations of piece on space and capture status are filtered by the validateCaptureRules call
            } catch (error) {
                if (error instanceof InvalidSpaceError) {
                    //space is off the board
                    continue;
                }

                //some unexpected error occured, so we re-throw
                throw error;
            }
        }

        return moves;
    };
}
