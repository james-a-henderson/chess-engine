import {
    BoardPosition,
    JumpMove,
    LegalMovesForPiece,
    MoveConditionFunction,
    MoveOptions,
    MoveRecord,
    PlayerColor,
    verifyLegalMoveFunction
} from '../../../../types';
import { rectangularBoardHelper } from '../../../board';
import { GameState } from '../../../gameState';
import {
    getMoveConditionFunctions,
    positionsAreEqual,
    validateCaputureRules
} from '../helpers';

export function generateVerifyJumpMoveFunction<PieceNames extends string[]>(
    pieceName: PieceNames[keyof PieceNames],
    move: JumpMove<PieceNames>
): verifyLegalMoveFunction<PieceNames> {
    const conditionFunctions = getMoveConditionFunctions(
        move.moveConditions ?? []
    );

    return generateFunction(pieceName, move, conditionFunctions);
}

function generateFunction<PieceNames extends string[]>(
    pieceName: PieceNames[keyof PieceNames],
    move: JumpMove<PieceNames>,
    conditionFunctions: MoveConditionFunction<PieceNames>[]
): verifyLegalMoveFunction<PieceNames> {
    return (
        state: GameState<PieceNames>,
        origin: BoardPosition,
        destination: BoardPosition,
        getLegalMovesFunctions: LegalMovesForPiece<PieceNames>,
        previousMove?: MoveRecord<PieceNames>,
        moveOptions?: MoveOptions<PieceNames>
    ) => {
        if (positionsAreEqual(origin, destination)) {
            //destination space can't be the space piece currently occupies
            return false;
        }

        const originSpace = rectangularBoardHelper.getSpace(state, origin);

        if (
            !originSpace.piece ||
            originSpace.piece.name !== pieceName ||
            originSpace.piece.color !== state.currentPlayer
        ) {
            //incorrect piece
            //throwing here might be more appropriate
            return false;
        }

        if (
            !validateCaputureRules(
                state,
                origin,
                destination,
                move.captureAvailability
            )
        ) {
            return false;
        }

        for (const conditionFunction of conditionFunctions) {
            if (
                !conditionFunction(state, {
                    piecePosition: origin,
                    getLegalMovesFunctions: getLegalMovesFunctions,
                    previousMove: previousMove
                })
            ) {
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

        const fileIndexDifference = destinationFileIndex - originFileIndex;
        const rankIndexDifference = destinationRankIndex - originRankIndex;

        for (const coordinate of move.jumpCoordinates) {
            if (
                !validateCoordinate(
                    coordinate,
                    fileIndexDifference,
                    rankIndexDifference,
                    state.currentPlayer
                )
            ) {
                continue;
            }

            return {
                type: 'jump',
                originSpace: origin,
                destinationSpace: destination,
                moveName: move.name,
                pieceColor: state.currentPlayer,
                pieceName: pieceName,
                promotedTo:
                    moveOptions?.type === 'promotion'
                        ? moveOptions.promotionTarget
                        : undefined
            };
        }

        return false;
    };
}

function validateCoordinate(
    jumpCoordinate: { horizontalSpaces: number; verticalSpaces: number },
    fileIndexDifference: number,
    rankIndexDifference: number,
    pieceColor: PlayerColor
): boolean {
    let horizontalSpaces = jumpCoordinate.horizontalSpaces;
    let verticalSpaces = jumpCoordinate.verticalSpaces;

    if (pieceColor === 'black') {
        //invert coordinates for black
        horizontalSpaces = -horizontalSpaces;
        verticalSpaces = -verticalSpaces;
    }

    return (
        fileIndexDifference === horizontalSpaces &&
        rankIndexDifference === verticalSpaces
    );
}
