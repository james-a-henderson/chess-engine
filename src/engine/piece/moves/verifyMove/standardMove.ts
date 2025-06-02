import { BoardPosition } from '../../../../types';
import {
    CaptureAvailability,
    Direction,
    PlayerColor,
    RectangularBoardConfig,
    StandardMove
} from '../../../../types/configuration';
import {
    moveConditionFunction,
    verifyLegalMoveFunction
} from '../../../../types/moves';
import { RectangularBoard } from '../../../board';
import { Piece } from '../../piece';
import {
    getMoveConditionFunctions,
    makeNextSpaceIterator,
    positionsAreEqual,
    reverseDirection,
    validateCaptureRules
} from '../helpers';

export function generateVerifyStandardMoveFunctions<
    PieceNames extends string[]
>(
    move: StandardMove<PieceNames>,
    boardConfig: RectangularBoardConfig
): verifyLegalMoveFunction<PieceNames>[] {
    if (move.alternateCaptureLocations) {
        //todo: add alternate capture locations
        return [];
    }

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
        return [];
    }

    const conditionFunctions = getMoveConditionFunctions(
        move.moveConditions ?? []
    );

    const maxSpaces =
        move.maxSpaces === 'unlimited'
            ? Math.max(boardConfig.height, boardConfig.width)
            : move.maxSpaces;
    const minSpaces = move.minSpaces ? move.minSpaces : 1;
    return [
        generateFunction(
            move.captureAvailability,
            directions,
            maxSpaces,
            minSpaces,
            conditionFunctions,
            move.name
        )
    ];
}

//todo: rename
function generateFunction<PieceNames extends string[]>(
    captureAvailability: CaptureAvailability,
    directions: Direction[],
    maxSpaces: number,
    minSpaces: number,
    conditionFunctions: moveConditionFunction<PieceNames>[],
    moveName: string
): verifyLegalMoveFunction<PieceNames> {
    return (
        board: RectangularBoard<PieceNames>,
        piece: Piece<PieceNames>,
        currentSpace: BoardPosition,
        destination: BoardPosition
    ) => {
        if (positionsAreEqual(currentSpace, destination)) {
            //destination cannot be the space the piece currently occupies
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
            if (!conditionFunction(piece, board)) {
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

        if (!directions.includes(direction)) {
            return false;
        }

        const moveLength = calculateMoveLength(
            direction,
            currentFileIndex,
            currentRankIndex,
            destinationFileIndex,
            destinationRankIndex
        );

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
            moveName: moveName
        };
    };
}

function determineMoveDirection(
    currentFileIndex: number,
    currentRankIndex: number,
    destinationFileIndex: number,
    destinationRankIndex: number,
    pieceColor: PlayerColor
): Direction | 'invalid' {
    const direction = determineMoveDirectionForWhite(
        currentFileIndex,
        currentRankIndex,
        destinationFileIndex,
        destinationRankIndex
    );

    if (direction !== 'invalid' && pieceColor === 'black') {
        return reverseDirection(direction);
    }

    return direction;
}

function determineMoveDirectionForWhite(
    currentFileIndex: number,
    currentRankIndex: number,
    destinationFileIndex: number,
    destinationRankIndex: number
): Direction | 'invalid' {
    if (
        currentFileIndex === destinationFileIndex &&
        currentRankIndex === destinationRankIndex
    ) {
        //cannot have piece on same square
        return 'invalid';
    }

    if (currentFileIndex === destinationFileIndex) {
        return currentRankIndex > destinationRankIndex ? 'backward' : 'forward';
    }

    if (currentRankIndex === destinationRankIndex) {
        return currentFileIndex > destinationFileIndex ? 'left' : 'right';
    }

    if (
        currentFileIndex - currentRankIndex ===
        destinationFileIndex - destinationRankIndex
    ) {
        if (currentFileIndex > destinationFileIndex) {
            return 'leftBackward';
        }
        return 'rightForward';
    }

    if (
        currentFileIndex + currentRankIndex ===
        destinationFileIndex + destinationRankIndex
    ) {
        if (currentFileIndex > destinationFileIndex) {
            return 'leftForward';
        }

        return 'rightBackward';
    }

    return 'invalid';
}

function calculateMoveLength(
    direction: Direction,
    currentFileIndex: number,
    currentRankIndex: number,
    destinationFileIndex: number,
    destinationRankIndex: number
): number {
    switch (direction) {
        case 'forward':
        case 'backward':
            return Math.abs(currentRankIndex - destinationRankIndex);
        default:
            //diagonal move length is equivilent to the number of spaces moved horizontally or vertically
            return Math.abs(currentFileIndex - destinationFileIndex);
    }
}
