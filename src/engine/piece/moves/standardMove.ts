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

export function generateVerifyStandardMoveFunctions<
    PieceNames extends string[]
>(
    move: StandardMove<PieceNames>,
    color: PlayerColor,
    boardConfig: RectangularBoard
): verifyLegalMoveFunction<PieceNames>[] {
    if (move.alternateCaptureLocations) {
        throw new Error('alternate capture locations not supported yet');
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

    const moveFunctions: verifyLegalMoveFunction<PieceNames>[] = [];

    for (const direction of directions) {
        let maxSpaces = move.maxSpaces;
        const minSpaces = move.minSpaces ? move.minSpaces : 1;
        switch (direction) {
            case 'forward':
                maxSpaces =
                    move.maxSpaces === 'unlimited'
                        ? boardConfig.height
                        : move.maxSpaces;

                if (color === 'white') {
                    moveFunctions.push(
                        generateVerticalMoveTowardsBlack(
                            move.captureAvailability,
                            maxSpaces,
                            minSpaces
                        )
                    );
                } else {
                    moveFunctions.push(
                        generateVerticalMoveTowardsWhite(
                            move.captureAvailability,
                            maxSpaces,
                            minSpaces
                        )
                    );
                }
                break;
            case 'backward':
                maxSpaces =
                    move.maxSpaces === 'unlimited'
                        ? boardConfig.height
                        : move.maxSpaces;

                if (color === 'white') {
                    moveFunctions.push(
                        generateVerticalMoveTowardsWhite(
                            move.captureAvailability,
                            maxSpaces,
                            minSpaces
                        )
                    );
                } else {
                    moveFunctions.push(
                        generateVerticalMoveTowardsBlack(
                            move.captureAvailability,
                            maxSpaces,
                            minSpaces
                        )
                    );
                }
                break;
            default:
                throw new Error('Other move directions not supported');
        }
    }

    return moveFunctions;
}

function generateVerticalMoveTowardsBlack<PieceNames extends string[]>(
    captureAvailability: CaptureAvailability,
    maxSpaces: number,
    minSpaces: number
): verifyLegalMoveFunction<PieceNames> {
    return (
        engine: GameEngine<PieceNames>,
        piece: Piece<PieceNames>,
        destination: BoardPosition
    ) => {
        if (
            !validateSharedRules(
                piece,
                engine,
                destination,
                captureAvailability
            )
        ) {
            return false;
        }

        if (piece.position[0] !== destination[0]) {
            //forward and backward moves require piece to be on same file
            return false;
        }

        const [currentFileIndex, currentRankIndex] =
            engine.coordinatesToIndicies(piece.position);
        const destinationRankIndex =
            engine.coordinatesToIndicies(destination)[1];

        if (destinationRankIndex < currentRankIndex) {
            //destination must be forward
            return false;
        }

        const rankDifference = destinationRankIndex - currentRankIndex;
        if (rankDifference > maxSpaces || rankDifference < minSpaces) {
            //must be within max and min number of spaces
            return false;
        }

        //check if there are any pieces in between current position and destination
        for (
            let rank = currentRankIndex + 1;
            rank < destinationRankIndex;
            rank++
        ) {
            if (engine.getSpace([currentFileIndex, rank]).piece !== undefined) {
                return false;
            }
        }

        return true;
    };
}

function generateVerticalMoveTowardsWhite<PieceNames extends string[]>(
    captureAvailability: CaptureAvailability,
    maxSpaces: number,
    minSpaces: number
): verifyLegalMoveFunction<PieceNames> {
    return (
        engine: GameEngine<PieceNames>,
        piece: Piece<PieceNames>,
        destination: BoardPosition
    ) => {
        if (
            !validateSharedRules(
                piece,
                engine,
                destination,
                captureAvailability
            )
        ) {
            return false;
        }

        if (piece.position[0] !== destination[0]) {
            //forward and backward moves require piece to be on same file
            return false;
        }

        const [currentFileIndex, currentRankIndex] =
            engine.coordinatesToIndicies(piece.position);
        const destinationRankIndex =
            engine.coordinatesToIndicies(destination)[1];

        if (destinationRankIndex > currentRankIndex) {
            //destination must be forward
            return false;
        }

        const rankDifference = currentRankIndex - destinationRankIndex;
        if (rankDifference > maxSpaces || rankDifference < minSpaces) {
            //must be within max and min number of spaces
            return false;
        }

        //check if there are any pieces in between current position and destination
        for (
            let rank = currentRankIndex - 1;
            rank > destinationRankIndex;
            rank--
        ) {
            if (engine.getSpace([currentFileIndex, rank]).piece !== undefined) {
                return false;
            }
        }
        return true;
    };
}

function pieceIsOnPosition<PieceNames extends string[]>(
    piece: Piece<PieceNames>,
    position: BoardPosition
): boolean {
    return (
        piece.position[0] === position[0] && piece.position[1] === position[1]
    );
}

function validateSharedRules<PieceNames extends string[]>(
    piece: Piece<PieceNames>,
    engine: GameEngine<PieceNames>,
    destination: BoardPosition,
    captureAvailability: CaptureAvailability
): boolean {
    if (pieceIsOnPosition(piece, destination)) {
        //destination cannot be the space the piece currently occupies
        return false;
    }

    const destinationSpace = engine.getSpace(destination);

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
