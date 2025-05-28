import {
    CaptureAvailability,
    Direction,
    getLegalMovesFunction,
    InvalidSpaceError,
    LegalMove,
    moveConditionFunction,
    RectangularBoard,
    StandardMove
} from '../../../../types';
import { GameEngine } from '../../../GameEngine';
import { Piece } from '../../piece';
import { getMoveConditionFunctions, makeNextSpaceIterator } from '../helpers';

//todo: determine way to return positions that satisfy the following conditions:
// 1. capture is required
// 2. space is currently empty
// this will be needed to determine spaces a king can't move due to being put in check
export function generateGetLegalStandardMovesFunction<
    PieceNames extends string[]
>(
    move: StandardMove<PieceNames>,
    boardConfig: RectangularBoard
): getLegalMovesFunction<PieceNames> {
    const conditionFunctions = getMoveConditionFunctions(
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
        //return function that returns empty array if move has no directions
        return () => {
            return [];
        };
    }

    const maxSpaces =
        move.maxSpaces === 'unlimited'
            ? Math.max(boardConfig.height, boardConfig.width)
            : move.maxSpaces;
    const minSpaces = move.minSpaces ? move.minSpaces : 1;
    return generateFunction(
        move.captureAvailability,
        directions,
        maxSpaces,
        minSpaces,
        conditionFunctions
    );
}

function generateFunction<PieceNames extends string[]>(
    captureAvailability: CaptureAvailability,
    directions: Direction[],
    maxSpaces: number,
    minSpaces: number,
    conditionFunctions: moveConditionFunction<PieceNames>[]
): getLegalMovesFunction<PieceNames> {
    return (engine: GameEngine<PieceNames>, piece: Piece<PieceNames>) => {
        const moves: LegalMove[] = [];

        for (const conditionFunction of conditionFunctions) {
            if (!conditionFunction(piece, engine)) {
                return [];
            }
        }

        for (const direction of directions) {
            moves.push(
                ...getMovesForDirection(
                    direction,
                    piece,
                    engine,
                    captureAvailability,
                    maxSpaces,
                    minSpaces
                )
            );
        }

        return moves;
    };
}

function getMovesForDirection<PieceNames extends string[]>(
    direction: Direction,
    piece: Piece<PieceNames>,
    engine: GameEngine<PieceNames>,
    captureAvailability: CaptureAvailability,
    maxSpaces: number,
    minSpaces: number
): LegalMove[] {
    const moves: LegalMove[] = [];

    let spaceCount = 0;

    const [currentFileIndex, currentRankIndex] = engine.coordinatesToIndicies(
        piece.position
    );

    for (const spaceIndicies of makeNextSpaceIterator(
        direction,
        currentFileIndex,
        currentRankIndex,
        maxSpaces,
        piece.playerColor
    )) {
        spaceCount++;

        try {
            const space = engine.getSpace(spaceIndicies);

            if (spaceCount < minSpaces) {
                if (space.piece) {
                    //piece is on position before minimum number of spaces have been reached
                    //therefore, there are no valid moves this direction
                    break;
                }

                //empty space before minimum number of spaces, therefore we move to next space without adding anything
                continue;
            }

            if (space.piece) {
                if (
                    space.piece.playerColor !== piece.playerColor &&
                    (captureAvailability === 'optional' ||
                        captureAvailability === 'required')
                ) {
                    moves.push({
                        position: space.position,
                        captureStatus: 'isCaptureMove'
                    });
                }

                //we cannot continue beyond a piece on the board
                break;
            }

            //no piece on space
            if (captureAvailability === 'optional') {
                moves.push({
                    position: space.position,
                    captureStatus: 'canCapture'
                });
            }

            if (captureAvailability === 'forbidden') {
                moves.push({
                    position: space.position,
                    captureStatus: 'cannotCapture'
                });
            }
        } catch (error) {
            if (error instanceof InvalidSpaceError) {
                //space is off the board;
                break;
            }

            //some unexpected error occured, so we re-throw
            throw error;
        }
    }

    return moves;
}
