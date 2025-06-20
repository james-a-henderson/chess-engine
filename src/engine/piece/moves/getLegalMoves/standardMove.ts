import {
    AvailableMoves,
    BoardPosition,
    CaptureAvailability,
    Direction,
    emptyGetMovesFunction,
    GetLegalMovesFunction,
    InvalidSpaceError,
    MoveConditionFunction,
    RectangularBoardConfig,
    StandardMove
} from '../../../../types';
import { RectangularBoard } from '../../../board/rectangularBoard';
import { Piece } from '../../piece';
import { getMoveConditionFunctions, makeNextSpaceIterator } from '../helpers';

//todo: filter out spaces that fail board.verifyMovePositionValid
export function generateGetLegalStandardMovesFunction<
    PieceNames extends string[]
>(
    move: StandardMove<PieceNames>,
    boardConfig: RectangularBoardConfig
): GetLegalMovesFunction<PieceNames> {
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
        //return function that returns no moves if move has no directions
        return emptyGetMovesFunction;
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
    conditionFunctions: MoveConditionFunction<PieceNames>[]
): GetLegalMovesFunction<PieceNames> {
    return (
        board: RectangularBoard<PieceNames>,
        piece: Piece<PieceNames>,
        currentSpace: BoardPosition
    ) => {
        const availableMoves: AvailableMoves = {
            moves: [],
            captureMoves: [],
            spacesThreatened: []
        };

        for (const conditionFunction of conditionFunctions) {
            if (!conditionFunction(piece, board, currentSpace)) {
                return availableMoves;
            }
        }

        for (const direction of directions) {
            const directionMoves = getMovesForDirection(
                direction,
                piece,
                currentSpace,
                board,
                captureAvailability,
                maxSpaces,
                minSpaces
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
    direction: Direction,
    piece: Piece<PieceNames>,
    currentSpace: BoardPosition,
    board: RectangularBoard<PieceNames>,
    captureAvailability: CaptureAvailability,
    maxSpaces: number,
    minSpaces: number
): AvailableMoves {
    const availableMoves: AvailableMoves = {
        moves: [],
        captureMoves: [],
        spacesThreatened: []
    };

    let spaceCount = 0;

    const [currentFileIndex, currentRankIndex] =
        board.coordinatesToIndicies(currentSpace);

    for (const spaceIndicies of makeNextSpaceIterator(
        direction,
        currentFileIndex,
        currentRankIndex,
        maxSpaces,
        piece.playerColor
    )) {
        spaceCount++;

        try {
            const space = board.getSpace(spaceIndicies);

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
                    availableMoves.moves.push(space.position);
                    availableMoves.captureMoves.push(space.position);
                    availableMoves.spacesThreatened.push(space.position);
                }

                //we cannot continue beyond a piece on the board
                break;
            }

            //no piece on space
            switch (captureAvailability) {
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
        } catch (error) {
            if (error instanceof InvalidSpaceError) {
                //space is off the board;
                break;
            }

            //some unexpected error occured, so we re-throw
            throw error;
        }
    }

    return availableMoves;
}
