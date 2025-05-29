import {
    AvailableMoves,
    BoardPosition,
    CaptureAvailability,
    getLegalMovesFunction,
    InvalidSpaceError,
    JumpMove,
    moveConditionFunction
} from '../../../../types';
import { GameEngine } from '../../../GameEngine';
import { Piece } from '../../piece';
import { getMoveConditionFunctions } from '../helpers';

export function generateGetLegalJumpMovesFunction<PieceNames extends string[]>(
    move: JumpMove<PieceNames>
): getLegalMovesFunction<PieceNames> {
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
    conditionFunctions: moveConditionFunction<PieceNames>[]
): getLegalMovesFunction<PieceNames> {
    return (
        engine: GameEngine<PieceNames>,
        piece: Piece<PieceNames>,
        currentSpace: BoardPosition
    ) => {
        const availableMoves: AvailableMoves = {
            moves: [],
            captureMoves: [],
            spacesThreatened: []
        };

        for (const conditionFunction of conditionFunctions) {
            if (!conditionFunction(piece, engine)) {
                return availableMoves;
            }
        }

        const [currentFileIndex, currentRankIndex] =
            engine.coordinatesToIndicies(currentSpace);

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
                const space = engine.getSpace([fileIndex, rankIndex]);

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
