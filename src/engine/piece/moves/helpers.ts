import {
    BoardPosition,
    CaptureAvailability,
    Direction,
    MoveCondition,
    MoveConditionFunction,
    PlayerColor
} from '../../../types';
import { RectangularBoard } from '../../board';
import { Piece } from '../piece';
import {
    firstPieceMove,
    generateOtherPieceHasNotMovedFunction,
    generateSpacesNotThreatenedFunction
} from './restrictions';

export function validateCaptureRules<PieceNames extends string[]>(
    piece: Piece<PieceNames>,
    board: RectangularBoard<PieceNames>,
    destination: BoardPosition,
    captureAvailability: CaptureAvailability
): boolean {
    const destinationSpace = board.getSpace(destination);

    if (destinationSpace.piece) {
        const destinationPiece = destinationSpace.piece;
        if (destinationPiece.playerColor === piece.playerColor) {
            //cannot move a piece onto the same space as piece of same color
            return false;
        }

        if (captureAvailability === 'forbidden') {
            //captures not allowed
            return false;
        }
    } else if (captureAvailability === 'required') {
        //cannot move to empty space, must capture
        return false;
    }

    return true;
}

export function positionsAreEqual(
    position1: BoardPosition,
    position2: BoardPosition
): boolean {
    return position1[0] === position2[0] && position1[1] === position2[1];
}

export function reverseDirection(direction: Direction): Direction {
    switch (direction) {
        case 'forward':
            return 'backward';
        case 'backward':
            return 'forward';
        case 'left':
            return 'right';
        case 'right':
            return 'left';
        case 'leftForward':
            return 'rightBackward';
        case 'rightForward':
            return 'leftBackward';
        case 'leftBackward':
            return 'rightForward';
        case 'rightBackward':
            return 'leftForward';
    }
}

export function getMoveConditionFunctions<PieceNames extends string[]>(
    conditions: MoveCondition<PieceNames>[]
): MoveConditionFunction<PieceNames>[] {
    const conditionFunctions: MoveConditionFunction<PieceNames>[] = [];

    for (const condition of conditions) {
        switch (condition.condition) {
            case 'firstPieceMove':
                conditionFunctions.push(firstPieceMove);
                break;
            case 'otherPieceHasNotMoved':
                conditionFunctions.push(
                    generateOtherPieceHasNotMovedFunction(
                        condition.piece,
                        condition.piecePositionForColor
                    )
                );
                break;
            case 'spacesNotThreatened':
                conditionFunctions.push(
                    generateSpacesNotThreatenedFunction(
                        condition.spacesForColor
                    )
                );
                break;
            case 'specificPreviousMove':
            //not implemented yet
        }
    }

    return conditionFunctions;
}

export function determineMoveDirection(
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

export function calculateMoveLength(
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

export function* makeNextSpaceIterator(
    direction: Direction,
    startFileIndex: number,
    startRankIndex: number,
    moveLength: number,
    color: PlayerColor
) {
    if (color === 'black') {
        direction = reverseDirection(direction);
    }

    let currentFileIndex = startFileIndex;
    let currentRankIndex = startRankIndex;

    for (let i = 0; i < moveLength; i++) {
        [currentFileIndex, currentRankIndex] = getNextSpace(
            direction,
            currentFileIndex,
            currentRankIndex
        );
        yield [currentFileIndex, currentRankIndex] as [number, number];
    }
}

function getNextSpace(
    direction: Direction,
    currentFileIndex: number,
    currentRankIndex: number
): [number, number] {
    switch (direction) {
        case 'forward':
            return [currentFileIndex, currentRankIndex + 1];
        case 'backward':
            return [currentFileIndex, currentRankIndex - 1];
        case 'left':
            return [currentFileIndex - 1, currentRankIndex];
        case 'right':
            return [currentFileIndex + 1, currentRankIndex];
        case 'leftForward':
            return [currentFileIndex - 1, currentRankIndex + 1];
        case 'leftBackward':
            return [currentFileIndex - 1, currentRankIndex - 1];
        case 'rightForward':
            return [currentFileIndex + 1, currentRankIndex + 1];
        case 'rightBackward':
            return [currentFileIndex + 1, currentRankIndex - 1];
    }
}
