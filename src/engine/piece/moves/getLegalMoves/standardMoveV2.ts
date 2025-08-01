import {
    AvailableMoves,
    BoardPosition,
    Direction,
    emptyGetMovesFunction,
    GameError,
    GetLegalMovesFunctionV2,
    InvalidSpaceError,
    LegalMovesForPiece,
    MoveRecord,
    StandardMove
} from '../../../../types';
import { rectangularBoardHelper } from '../../../board';
import { GameState } from '../../../gameState';
import {
    getMoveConditionFunctionsV2,
    makeNextSpaceIterator,
    reverseDirection
} from '../helpers';

export function generateGetLegalStandardMovesFunctionV2<
    PieceNames extends string[]
>(move: StandardMove<PieceNames>): GetLegalMovesFunctionV2<PieceNames> {
    const conditionFunctions = getMoveConditionFunctionsV2(
        move.moveConditions ?? []
    );

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
        return emptyGetMovesFunction;
    }

    return (
        state: GameState<PieceNames>,
        origin: BoardPosition,
        getLegalMovesFunctions: LegalMovesForPiece<PieceNames>,
        previousMove?: MoveRecord<PieceNames>
    ) => {
        const availableMoves: AvailableMoves = {
            moves: [],
            captureMoves: [],
            spacesThreatened: []
        };

        for (const conditionFunction of conditionFunctions) {
            if (
                !conditionFunction(state, {
                    piecePosition: origin,
                    getLegalMovesFunctions: getLegalMovesFunctions,
                    previousMove: previousMove
                })
            ) {
                return availableMoves;
            }
        }

        const space = rectangularBoardHelper.getSpace(state, origin);

        if (space.piece?.color !== state.currentPlayer) {
            throw new GameError('Invalid origin space');
        }

        for (const direction of directions) {
            const directionMoves = getMovesForDirection(
                state,
                move,
                direction,
                origin
            );

            availableMoves.moves.push(...directionMoves.moves);
            availableMoves.captureMoves.push(...directionMoves.captureMoves);
            availableMoves.spacesThreatened.push(
                ...directionMoves.spacesThreatened
            );
        }

        return availableMoves;
    };
}

function getMovesForDirection<PieceNames extends string[]>(
    state: GameState<PieceNames>,
    move: StandardMove<PieceNames>,
    direction: Direction,
    origin: BoardPosition
): AvailableMoves {
    const maxSpaces =
        move.maxSpaces === 'unlimited'
            ? Math.max(state.boardConfig.height, state.boardConfig.width)
            : move.maxSpaces;
    const minSpaces = move.minSpaces ? move.minSpaces : 1;

    const availableMoves: AvailableMoves = {
        moves: [],
        captureMoves: [],
        spacesThreatened: []
    };

    let spaceCount = 0;

    const [originFileIndex, originRankIndex] =
        rectangularBoardHelper.coordinatesToIndicies(state.boardConfig, origin);

    for (const spaceIndicies of makeNextSpaceIterator(
        direction,
        originFileIndex,
        originRankIndex,
        maxSpaces,
        state.currentPlayer
    )) {
        spaceCount++;

        try {
            const space = rectangularBoardHelper.getSpace(state, spaceIndicies);

            if (spaceCount < minSpaces) {
                if (space.piece) {
                    //piece is on position before minimum number of spaces have been reached
                    //therefore, there are no valid moves in this direction
                    break;
                }

                //empty space before minimum number of spaces, therefore we move to next space without adding anything
                continue;
            }

            if (space.piece) {
                if (
                    !('alternateCaptureLocation' in move) &&
                    space.piece.color !== state.currentPlayer &&
                    (move.captureAvailability === 'optional' ||
                        move.captureAvailability === 'required')
                ) {
                    availableMoves.moves.push(space.position);
                    availableMoves.captureMoves.push(space.position);
                    availableMoves.spacesThreatened.push(space.position);
                }

                //we cannot continue beyond a piece on the board
                break;
            }

            //no piece on space
            if ('alternateCaptureLocation' in move) {
                const altCaptureDirection =
                    state.currentPlayer === 'white'
                        ? move.alternateCaptureLocation.direction
                        : reverseDirection(
                              move.alternateCaptureLocation.direction
                          );

                //this will throw invalidSpace error if not valid, which is caught later
                const captureSpace =
                    rectangularBoardHelper.getSpaceRelativePosition(
                        state,
                        space.position,
                        altCaptureDirection,
                        move.alternateCaptureLocation.numSpaces
                    );

                availableMoves.spacesThreatened.push(captureSpace.position);

                if (
                    captureSpace.piece &&
                    captureSpace.piece.color !== state.currentPlayer
                ) {
                    availableMoves.moves.push(space.position);
                    availableMoves.captureMoves.push(space.position);
                }
            } else {
                switch (move.captureAvailability) {
                    case 'optional':
                        availableMoves.moves.push(space.position);
                        availableMoves.spacesThreatened.push(space.position);
                        break;
                    case 'required':
                        availableMoves.spacesThreatened.push(space.position);
                        break;
                    case 'forbidden':
                        availableMoves.moves.push(space.position);
                }
            }
        } catch (error) {
            if (error instanceof InvalidSpaceError) {
                //space is off the board
                break;
            }

            //some unexpected error occurred, so we re-throw
            throw error;
        }
    }

    return availableMoves;
}
