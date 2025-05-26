import { BoardPosition } from '../../../types';
import {
    CaptureAvailability,
    Direction,
    PlayerColor,
    RectangularBoard,
    StandardMove
} from '../../../types/configuration';
import { verifyLegalMoveFunction } from '../../../types/moves';
import { GameEngine } from '../../GameEngine';
import { Piece } from '../piece';
import { pieceIsOnPosition, validateCaptureRules } from './helpers';

export function generateVerifyStandardMoveFunctions<
    PieceNames extends string[]
>(
    move: StandardMove<PieceNames>,
    boardConfig: RectangularBoard
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
            minSpaces
        )
    ];
}

//todo: rename
function generateFunction<PieceNames extends string[]>(
    captureAvailability: CaptureAvailability,
    directions: Direction[],
    maxSpaces: number,
    minSpaces: number
): verifyLegalMoveFunction<PieceNames> {
    return (
        engine: GameEngine<PieceNames>,
        piece: Piece<PieceNames>,
        destination: BoardPosition
    ) => {
        if (pieceIsOnPosition(piece, destination)) {
            //destination cannot be the space the piece currently occupies
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

        //the engine functions automatically throw if the destination space is invalid, so we don't need to check that here
        const [currentFileIndex, currentRankIndex] =
            engine.coordinatesToIndicies(piece.position);
        const [destinationFileIndex, destinationRankIndex] =
            engine.coordinatesToIndicies(destination);

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
            moveLength,
            piece.playerColor
        )) {
            if (engine.getSpace(space).piece !== undefined) {
                return false;
            }
        }

        return true;
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

function reverseDirection(direction: Direction): Direction {
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

function* makeNextSpaceIterator(
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

    for (let i = 0; i < moveLength - 1; i++) {
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
