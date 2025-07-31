import {
    BoardPosition,
    Direction,
    emptyVerifyMovesFunction,
    MoveConditionFunctionV2,
    MoveOptions,
    MoveRecord,
    StandardMove,
    StandardMoveAlternateCaptureLocation,
    verifyLegalMoveFunctionV2
} from '../../../../types';
import { rectangularBoardHelper } from '../../../board';
import { GameState } from '../../../gameState';
import {
    calculateMoveLength,
    determineMoveDirection,
    getMoveConditionFunctionsV2,
    makeNextSpaceIterator,
    positionsAreEqual,
    reverseDirection,
    validateCaputureRulesV2
} from '../helpers';

export function generateVerifyStandardMoveFunctionV2<
    PieceNames extends string[]
>(
    pieceName: PieceNames[keyof PieceNames],
    move: StandardMove<PieceNames>
): verifyLegalMoveFunctionV2<PieceNames> {
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

    const conditionFunctions = getMoveConditionFunctionsV2(
        move.moveConditions ?? []
    );

    return generateFunction(pieceName, move, conditionFunctions);
}

function generateFunction<PieceNames extends string[]>(
    pieceName: PieceNames[keyof PieceNames],
    move: StandardMove<PieceNames>,
    conditionFunctions: MoveConditionFunctionV2<PieceNames>[]
): verifyLegalMoveFunctionV2<PieceNames> {
    return (
        state: GameState<PieceNames>,
        origin: BoardPosition,
        destination: BoardPosition,
        previousMove?: MoveRecord<PieceNames>,
        moveOptions?: MoveOptions<PieceNames>
    ) => {
        let altCaptureLocation = undefined;

        if (positionsAreEqual(origin, destination)) {
            //destination cannot be the space the piece currently occupies
            return false;
        }

        const originSpace = rectangularBoardHelper.getSpace(state, origin);

        if (
            !originSpace.piece ||
            originSpace.piece.name !== pieceName ||
            originSpace.piece.color !== state.currentPlayer
        ) {
            //incorrect piece
            //throwing an error here might be more appropriate
            return false;
        }

        if ('alternateCaptureLocation' in move) {
            const altCaptureResult = validateAlternateCaptureLocation(
                state,
                move,
                destination
            );

            if (altCaptureResult) {
                altCaptureLocation = altCaptureResult;
            } else {
                return false;
            }
        } else if (
            !validateCaputureRulesV2(
                state,
                origin,
                destination,
                move.captureAvailability
            )
        ) {
            return false;
        }

        for (const conditionFunction of conditionFunctions) {
            if (!conditionFunction(state, origin, previousMove)) {
                return false;
            }
        }

        const [originFileIndex, originRankIndex] =
            rectangularBoardHelper.coordinatesToIndicies(
                state.boardConfig,
                origin
            );
        const [destinationFileIndex, destinationRankIndex] =
            rectangularBoardHelper.coordinatesToIndicies(
                state.boardConfig,
                destination
            );

        const direction = determineMoveDirection(
            originFileIndex,
            originRankIndex,
            destinationFileIndex,
            destinationRankIndex,
            state.currentPlayer
        );

        if (direction === 'invalid') {
            return false;
        }

        if (move.directions !== 'all' && !move.directions.includes(direction)) {
            return false;
        }

        const moveLength = calculateMoveLength(
            direction,
            originFileIndex,
            originRankIndex,
            destinationFileIndex,
            destinationRankIndex
        );

        const maxSpaces =
            move.maxSpaces === 'unlimited'
                ? Math.max(state.boardConfig.height, state.boardConfig.width)
                : move.maxSpaces;
        const minSpaces = move.minSpaces ? move.minSpaces : 1;

        //check if move length is within maximum and minimum number of spaces
        if (moveLength > maxSpaces || moveLength < minSpaces) {
            return false;
        }

        //determine if there are any pieces in between current position and destination
        for (const space of makeNextSpaceIterator(
            direction,
            originFileIndex,
            originRankIndex,
            moveLength - 1, //no need to calculate final destination space
            state.currentPlayer
        )) {
            if (
                rectangularBoardHelper.getSpace(state, space).piece !==
                undefined
            ) {
                return false;
            }
        }

        //todo: validate resulting board space is valid

        return {
            originSpace: origin,
            destinationSpace: destination,
            pieceName: pieceName,
            pieceColor: state.currentPlayer,
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
    state: GameState<PieceNames>,
    move: StandardMoveAlternateCaptureLocation<PieceNames>,
    destination: BoardPosition
): BoardPosition | false {
    const direction =
        state.currentPlayer === 'white'
            ? move.alternateCaptureLocation.direction
            : reverseDirection(move.alternateCaptureLocation.direction);

    try {
        const destinationSpace = rectangularBoardHelper.getSpace(
            state,
            destination
        );
        const captureSpace = rectangularBoardHelper.getSpaceRelativePosition(
            state,
            destination,
            direction,
            move.alternateCaptureLocation.numSpaces
        );

        if (destinationSpace.piece) {
            return false; //cannot move onto space with piece if alternate capture location is specified
        }

        if (
            !captureSpace.piece ||
            captureSpace.piece.color === state.currentPlayer
        ) {
            return false;
        }

        return captureSpace.position;
    } catch (error) {
        return false;
    }
}
