import {
    AvailableMoves,
    BoardPosition,
    GetLegalMovesFunctionV2,
    InvalidSpaceError,
    JumpMove,
    LegalMovesForPiece,
    MoveRecord
} from '../../../../types';
import { rectangularBoardHelper } from '../../../board';
import { GameState } from '../../../gameState';
import { getMoveConditionFunctionsV2 } from '../helpers';

export function generateGetLegalJumpMovesFunctionV2<
    PieceNames extends string[]
>(move: JumpMove<PieceNames>): GetLegalMovesFunctionV2<PieceNames> {
    const conditionFunctions = getMoveConditionFunctionsV2(
        move.moveConditions ?? []
    );

    return (
        state: GameState<PieceNames>,
        origin: BoardPosition,
        getLegalMovesFunctions: LegalMovesForPiece<PieceNames>,
        previousMove?: MoveRecord<PieceNames>
    ) => {
        const availableMoves: AvailableMoves = {
            moves: [],
            captureMoves: [],
            spacesThreatened: []
        };

        for (const conditionFunction of conditionFunctions) {
            if (
                !conditionFunction(state, {
                    piecePosition: origin,
                    getLegalMovesFunctions: getLegalMovesFunctions,
                    previousMove: previousMove
                })
            ) {
                return availableMoves;
            }
        }

        const [originFileIndex, originRankIndex] =
            rectangularBoardHelper.coordinatesToIndicies(
                state.boardConfig,
                origin
            );

        for (const coordinate of move.jumpCoordinates) {
            let horizontalSpaces = coordinate.horizontalSpaces;
            let verticalSpaces = coordinate.verticalSpaces;

            if (state.currentPlayer === 'black') {
                //invert coordinates for black
                horizontalSpaces = -horizontalSpaces;
                verticalSpaces = -verticalSpaces;
            }

            const fileIndex = originFileIndex + horizontalSpaces;
            const rankIndex = originRankIndex + verticalSpaces;

            try {
                const space = rectangularBoardHelper.getSpace(state, [
                    fileIndex,
                    rankIndex
                ]);

                if (space.piece?.color === state.currentPlayer) {
                    continue;
                }

                switch (move.captureAvailability) {
                    case 'optional':
                        availableMoves.moves.push(space.position);
                        availableMoves.spacesThreatened.push(space.position);
                        if (space.piece) {
                            availableMoves.captureMoves.push(space.position);
                        }
                        break;
                    case 'required':
                        //piece is threatening space, even if move is not legal
                        availableMoves.spacesThreatened.push(space.position);
                        if (space.piece) {
                            availableMoves.moves.push(space.position);
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
