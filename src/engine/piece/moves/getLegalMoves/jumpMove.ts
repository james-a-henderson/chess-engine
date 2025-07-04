import {
    AvailableMoves,
    BoardPosition,
    CaptureAvailability,
    GetLegalMovesFunction,
    InvalidSpaceError,
    JumpMove,
    MoveConditionFunction
} from '../../../../types';
import { RectangularBoard } from '../../../board/rectangularBoard';
import { Piece } from '../../piece';
import { getMoveConditionFunctions } from '../helpers';

//todo: filter out spaces that fail board.verifyMovePositionValid
export function generateGetLegalJumpMovesFunction<PieceNames extends string[]>(
    move: JumpMove<PieceNames>
): GetLegalMovesFunction<PieceNames> {
    const conditionFunctions = getMoveConditionFunctions(
        move.moveConditions ?? []
    );

    return generateFunction(
        move.captureAvailability,
        move.jumpCoordinates,
        conditionFunctions
    );
}

function generateFunction<PieceNames extends string[]>(
    captureAvailability: CaptureAvailability,
    jumpCoordinates: {
        horizontalSpaces: number;
        verticalSpaces: number;
    }[],
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

        const [currentFileIndex, currentRankIndex] =
            board.coordinatesToIndicies(currentSpace);

        for (const coordinate of jumpCoordinates) {
            let horizontalSpaces = coordinate.horizontalSpaces;
            let verticalSpaces = coordinate.verticalSpaces;

            if (piece.playerColor === 'black') {
                //invert coordinates for black
                horizontalSpaces = -horizontalSpaces;
                verticalSpaces = -verticalSpaces;
            }

            const fileIndex = currentFileIndex + horizontalSpaces;
            const rankIndex = currentRankIndex + verticalSpaces;

            try {
                const space = board.getSpace([fileIndex, rankIndex]);

                if (space.piece?.playerColor === piece.playerColor) {
                    continue;
                }

                switch (captureAvailability) {
                    case 'required':
                        //piece is threatening space, even if move is not legal
                        availableMoves.spacesThreatened.push(space.position);
                        if (space.piece) {
                            availableMoves.moves.push(space.position);
                            availableMoves.captureMoves.push(space.position);
                        }
                        break;
                    case 'optional':
                        availableMoves.moves.push(space.position);
                        availableMoves.spacesThreatened.push(space.position);
                        if (space.piece) {
                            availableMoves.captureMoves.push(space.position);
                        }
                        break;
                    case 'forbidden':
                        if (!space.piece) {
                            availableMoves.moves.push(space.position);
                        }
                }
            } catch (error) {
                if (error instanceof InvalidSpaceError) {
                    //space is off the board
                    continue;
                }

                //some unexpected error occured, so we re-throw
                throw error;
            }
        }

        return availableMoves;
    };
}
