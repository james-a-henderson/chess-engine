import {
    BoardPosition,
    GameError,
    IllegalMoveError,
    MoveRecord,
    MoveRecordCastle,
    MoveRecordJump,
    MoveRecordStandard
} from '../../types';
import { rectangularBoardHelper } from '../board';
import { GameState } from '../../types/engine/gameState';
import { getOtherPlayerColor } from '../../common';

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
            makeCastleMove(newState, move);
    }

    if (move.promotedTo) {
        promotePiece(newState, move.destinationSpace, move.promotedTo);
    }

    //todo: handle more then two player colors
    newState.currentPlayer = getOtherPlayerColor(newState.currentPlayer);

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
        if (altCaptureSpace.piece) {
            state.capturedPieces[altCaptureSpace.piece.color].push(
                altCaptureSpace.piece
            );
            altCaptureSpace.piece = undefined;
        }
    } else if (destinationSpace.piece) {
        state.capturedPieces[destinationSpace.piece.color].push(
            destinationSpace.piece
        );
    }

    originSpace.piece!.moveCount++;

    destinationSpace.piece = originSpace.piece;
    originSpace.piece = undefined;
}

function makeCastleMove<PieceNames extends string[]>(
    state: GameState<PieceNames>,
    move: MoveRecordCastle<PieceNames>
) {
    const originSpace = rectangularBoardHelper.getSpace(
        state,
        move.originSpace
    );
    const destinationSpace = rectangularBoardHelper.getSpace(
        state,
        move.destinationSpace
    );

    const targetOriginSpace = rectangularBoardHelper.getSpace(
        state,
        move.castleTarget.originSpace
    );
    const targetDestinationSpace = rectangularBoardHelper.getSpace(
        state,
        move.castleTarget.destinationSpace
    );

    const piece = originSpace.piece;
    const targetPiece = targetOriginSpace.piece;

    if (!piece || !targetPiece) {
        throw new GameError('Castling pieces not found');
    }

    originSpace.piece = undefined;
    targetOriginSpace.piece = undefined;

    destinationSpace.piece = piece;
    targetDestinationSpace.piece = targetPiece;

    piece.moveCount++;
    targetPiece.moveCount++;
}

function promotePiece<PieceNames extends string[]>(
    state: GameState<PieceNames>,
    position: BoardPosition,
    promoteTo: PieceNames[keyof PieceNames]
) {
    const space = rectangularBoardHelper.getSpace(state, position);
    const piece = space.piece;
    if (!piece) {
        throw new IllegalMoveError(
            'Attempting to promote on space with no piece'
        );
    }

    piece.name = promoteTo;
}
