import {
    BoardPosition,
    CaptureAvailability,
    JumpMove,
    MoveConditionFunction,
    MoveOptions,
    MoveRecord,
    PlayerColor,
    verifyLegalMoveFunction
} from '../../../../types';
import { RectangularBoard } from '../../../board';
import { Piece } from '../../piece';
import {
    getMoveConditionFunctions,
    positionsAreEqual,
    validateCaptureRules
} from '../helpers';

export function generateVerifyJumpMoveFunctions<PieceNames extends string[]>(
    move: JumpMove<PieceNames>
): verifyLegalMoveFunction<PieceNames> {
    const conditionFunctions = getMoveConditionFunctions(
        move.moveConditions ?? []
    );

    return generateFunction(
        move.captureAvailability,
        move.jumpCoordinates,
        conditionFunctions,
        move.name
    );
}

function generateFunction<PieceNames extends string[]>(
    captureAvailability: CaptureAvailability,
    jumpCoordinates: {
        horizontalSpaces: number;
        verticalSpaces: number;
    }[],
    conditionFunctions: MoveConditionFunction<PieceNames>[],
    moveName: string
): verifyLegalMoveFunction<PieceNames> {
    return (
        board: RectangularBoard<PieceNames>,
        piece: Piece<PieceNames>,
        currentSpace: BoardPosition,
        destination: BoardPosition,
        previousMove?: MoveRecord<PieceNames>,
        moveOptions?: MoveOptions<PieceNames>
    ) => {
        if (positionsAreEqual(currentSpace, destination)) {
            //destination space can't be the space the piece currently occupies
            return false;
        }

        if (
            !validateCaptureRules(
                piece,
                board,
                destination,
                captureAvailability
            )
        ) {
            return false;
        }

        for (const conditionFunction of conditionFunctions) {
            if (!conditionFunction(piece, board, currentSpace)) {
                return false;
            }
        }

        //these engine functions throw if destination space is invalid, so we don't need to check that here
        const [currentFileIndex, currentRankIndex] =
            board.coordinatesToIndicies(currentSpace);
        const [destinationFileIndex, destinationRankIndex] =
            board.coordinatesToIndicies(destination);

        const fileIndexDifference = destinationFileIndex - currentFileIndex;
        const rankIndexDifference = destinationRankIndex - currentRankIndex;

        for (const coordinate of jumpCoordinates) {
            if (
                !validateCoordinate(
                    coordinate,
                    fileIndexDifference,
                    rankIndexDifference,
                    piece.playerColor
                )
            ) {
                continue;
            }

            if (!board.verifyMovePositionValid(currentSpace, destination)) {
                return false;
            }

            return {
                originSpace: currentSpace,
                destinationSpace: destination,
                moveName: moveName,
                pieceColor: piece.playerColor,
                pieceName: piece.pieceName,
                type: 'jump',
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
