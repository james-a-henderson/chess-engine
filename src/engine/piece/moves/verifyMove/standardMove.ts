import { BoardPosition } from '../../../../types';
import {
    Direction,
    StandardMove,
    StandardMoveAlternateCaptureLocation
} from '../../../../types/configuration';
import {
    emptyVerifyMovesFunction,
    MoveConditionFunction,
    MoveOptions,
    MoveRecord,
    verifyLegalMoveFunction
} from '../../../../types/moves';
import { RectangularBoard } from '../../../board';
import { Piece } from '../../piece';
import {
    calculateMoveLength,
    determineMoveDirection,
    getMoveConditionFunctions,
    makeNextSpaceIterator,
    positionsAreEqual,
    reverseDirection,
    validateCaptureRules
} from '../helpers';

export function generateVerifyStandardMoveFunctions<
    PieceNames extends string[]
>(move: StandardMove<PieceNames>): verifyLegalMoveFunction<PieceNames> {
    const directions: Direction[] =
        move.directions !== 'all'
            ? move.directions
            : [
                  'forward',
                  'backward',
                  'left',
                  'right',
                  'leftForward',
                  'rightForward',
                  'leftBackward',
                  'rightBackward'
              ];
    if (directions.length === 0) {
        return emptyVerifyMovesFunction;
    }

    const conditionFunctions = getMoveConditionFunctions(
        move.moveConditions ?? []
    );

    return generateFunction(move, conditionFunctions);
}

//todo: rename
function generateFunction<PieceNames extends string[]>(
    move: StandardMove<PieceNames>,
    conditionFunctions: MoveConditionFunction<PieceNames>[]
): verifyLegalMoveFunction<PieceNames> {
    return (
        board: RectangularBoard<PieceNames>,
        piece: Piece<PieceNames>,
        currentSpace: BoardPosition,
        destination: BoardPosition,
        previousMove?: MoveRecord<PieceNames>,
        moveOptions?: MoveOptions<PieceNames>
    ) => {
        let altCaptureLocation = undefined;
        if (positionsAreEqual(currentSpace, destination)) {
            //destination cannot be the space the piece currently occupies
            return false;
        }

        if ('alternateCaptureLocation' in move) {
            const altCaptureResult = validateAlternateCaptureLocation(
                board,
                piece,
                move,
                destination
            );
            if (altCaptureResult) {
                altCaptureLocation = altCaptureResult;
            } else {
                return false;
            }
        } else if (
            !validateCaptureRules(
                piece,
                board,
                destination,
                move.captureAvailability
            )
        ) {
            return false;
        }

        for (const conditionFunction of conditionFunctions) {
            if (!conditionFunction(piece, board, currentSpace, previousMove)) {
                return false;
            }
        }

        //the engine functions automatically throw if the destination space is invalid, so we don't need to check that here
        const [currentFileIndex, currentRankIndex] =
            board.coordinatesToIndicies(currentSpace);
        const [destinationFileIndex, destinationRankIndex] =
            board.coordinatesToIndicies(destination);

        const direction = determineMoveDirection(
            currentFileIndex,
            currentRankIndex,
            destinationFileIndex,
            destinationRankIndex,
            piece.playerColor
        );

        if (direction === 'invalid') {
            return false;
        }

        if (move.directions !== 'all' && !move.directions.includes(direction)) {
            return false;
        }

        const moveLength = calculateMoveLength(
            direction,
            currentFileIndex,
            currentRankIndex,
            destinationFileIndex,
            destinationRankIndex
        );

        const maxSpaces =
            move.maxSpaces === 'unlimited'
                ? Math.max(board.height, board.width)
                : move.maxSpaces;
        const minSpaces = move.minSpaces ? move.minSpaces : 1;

        //check if move length is within maximum and minimum number of spaces
        if (moveLength > maxSpaces || moveLength < minSpaces) {
            return false;
        }

        //determine if there are any pieces in between current position and destination
        for (const space of makeNextSpaceIterator(
            direction,
            currentFileIndex,
            currentRankIndex,
            moveLength - 1, //no need to calculate final destination space
            piece.playerColor
        )) {
            if (board.getSpace(space).piece !== undefined) {
                return false;
            }
        }

        //validate that the resulting board state is valid
        if (!board.verifyMovePositionValid(currentSpace, destination)) {
            return false;
        }

        return {
            originSpace: currentSpace,
            destinationSpace: destination,
            pieceName: piece.pieceName,
            pieceColor: piece.playerColor,
            moveName: move.name,
            type: 'standard',
            promotedTo:
                moveOptions?.type === 'promotion'
                    ? moveOptions.promotionTarget
                    : undefined,
            altCaptureLocation: altCaptureLocation
        };
    };
}

function validateAlternateCaptureLocation<PieceNames extends string[]>(
    board: RectangularBoard<PieceNames>,
    piece: Piece<PieceNames>,
    move: StandardMoveAlternateCaptureLocation<PieceNames>,
    destination: BoardPosition
): BoardPosition | false {
    const direction =
        piece.playerColor === 'white'
            ? move.alternateCaptureLocation.direction
            : reverseDirection(move.alternateCaptureLocation.direction);

    try {
        const destinationSpace = board.getSpace(destination);
        const captureSpace = board.getSpaceRelativePosition(
            destination,
            direction,
            move.alternateCaptureLocation.numSpaces
        );

        if (destinationSpace.piece) {
            return false; //cannot move onto space with piece if alternate capture location is specified
        }

        if (
            !captureSpace.piece ||
            captureSpace.piece.playerColor === piece.playerColor
        ) {
            return false;
        }

        return captureSpace.position;
    } catch (error) {
        return false;
    }
}
