import { MoveRecord, MoveRecordJump, MoveRecordStandard } from '../../types';
import { rectangularBoardHelper } from '../board';
import { GameState } from './gameState';

//when we get here, we assume that the move has been verified
export function updateGameState<PieceNames extends string[]>(
    state: GameState<PieceNames>,
    move: MoveRecord<PieceNames>
): GameState<PieceNames> {
    const newState = structuredClone(state);
    newState.lastMove = move;

    switch (move.type) {
        case 'standard':
        case 'jump':
            makeStandardMove(newState, move);
            break;
        case 'castle':
        //todo: add castle moves
    }

    if (move.promotedTo) {
        //todo: handle piece promotion
    }

    //todo: handle more then two player colors
    newState.currentPlayer =
        newState.currentPlayer === 'white' ? 'black' : 'white';

    return newState;
}

function makeStandardMove<PieceNames extends string[]>(
    state: GameState<PieceNames>,
    move: MoveRecordStandard<PieceNames> | MoveRecordJump<PieceNames>
) {
    const originSpace = rectangularBoardHelper.getSpace(
        state,
        move.originSpace
    );
    const destinationSpace = rectangularBoardHelper.getSpace(
        state,
        move.destinationSpace
    );

    if (move.altCaptureLocation) {
        const altCaptureSpace = rectangularBoardHelper.getSpace(
            state,
            move.altCaptureLocation
        );
        //todo: track captured pieces
        altCaptureSpace.piece = undefined;
    }

    originSpace.piece!.moveCount++;

    destinationSpace.piece = originSpace.piece;
    originSpace.piece = undefined;
}
