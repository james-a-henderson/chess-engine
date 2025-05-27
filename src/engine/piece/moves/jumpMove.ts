import {
    BoardPosition,
    CaptureAvailability,
    JumpMove,
    moveConditionFunction,
    PlayerColor,
    verifyLegalMoveFunction
} from '../../../types';
import { GameEngine } from '../../GameEngine';
import { Piece } from '../piece';
import {
    getMoveConditionFunctions,
    pieceIsOnPosition,
    validateCaptureRules
} from './helpers';

export function generateVerifyJumpMoveFunctions<PieceNames extends string[]>(
    move: JumpMove<PieceNames>
): verifyLegalMoveFunction<PieceNames>[] {
    const conditionFunctions = getMoveConditionFunctions(
        move.moveConditions ?? []
    );

    return [
        generateFunction(
            move.captureAvailability,
            move.jumpCoordinates,
            conditionFunctions
        )
    ];
}

function generateFunction<PieceNames extends string[]>(
    captureAvailability: CaptureAvailability,
    jumpCoordinates: {
        horizontalSpaces: number;
        verticalSpaces: number;
    }[],
    conditionFunctions: moveConditionFunction<PieceNames>[]
): verifyLegalMoveFunction<PieceNames> {
    return (
        engine: GameEngine<PieceNames>,
        piece: Piece<PieceNames>,
        destination: BoardPosition
    ) => {
        if (pieceIsOnPosition(piece, destination)) {
            //destination space can't be the space the piece currently occupies
            return false;
        }

        if (
            !validateCaptureRules(
                piece,
                engine,
                destination,
                captureAvailability
            )
        ) {
            return false;
        }

        for (const conditionFunction of conditionFunctions) {
            if (!conditionFunction(piece, engine)) {
                return false;
            }
        }

        //these engine functions throw if destination space is invalid, so we don't need to check that here
        const [currentFileIndex, currentRankIndex] =
            engine.coordinatesToIndicies(piece.position);
        const [destinationFileIndex, destinationRankIndex] =
            engine.coordinatesToIndicies(destination);

        const fileIndexDifference = destinationFileIndex - currentFileIndex;
        const rankIndexDifference = destinationRankIndex - currentRankIndex;

        for (const coordinate of jumpCoordinates) {
            if (
                validateCoordinate(
                    coordinate,
                    fileIndexDifference,
                    rankIndexDifference,
                    piece.playerColor
                )
            ) {
                return true;
            }
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
