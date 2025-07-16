import { fileLetterToIndex } from '../../common';
import {
    BoardPosition,
    MoveRecord,
    MoveRecordJump,
    MoveRecordStandard
} from '../../types';
import { BoardSpaceStatus, GameState } from './gameState';

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
    const originSpace = getSpace(state, move.originSpace);
    const destinationSpace = getSpace(state, move.destinationSpace);

    if (move.altCaptureLocation) {
        const altCaptureSpace = getSpace(state, move.altCaptureLocation);
        //todo: track captured pieces
        altCaptureSpace.piece = undefined;
    }

    originSpace.piece!.moveCount++;

    destinationSpace.piece = originSpace.piece;
    originSpace.piece = undefined;
}

//todo: move these functions to generally accessable location
function getSpace<PieceNames extends string[]>(
    state: GameState<PieceNames>,
    position: BoardPosition | [number, number]
): BoardSpaceStatus<PieceNames> {
    let fileIndex: number;
    let rankIndex: number;

    if (typeof position[0] === 'string') {
        [fileIndex, rankIndex] = coordinatesToIndicies([
            position[0],
            position[1]
        ]);
    } else {
        [fileIndex, rankIndex] = position;
    }

    return state.board[fileIndex][rankIndex];
}

function coordinatesToIndicies(coordinates: BoardPosition): [number, number] {
    const fileIndex = fileLetterToIndex(coordinates[0]);
    const rankIndex = coordinates[1] - 1;

    return [fileIndex, rankIndex];
}
