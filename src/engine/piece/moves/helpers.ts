import { BoardPosition, CaptureAvailability } from '../../../types';
import { GameEngine } from '../../GameEngine';
import { Piece } from '../piece';

export function validateCaptureRules<PieceNames extends string[]>(
    piece: Piece<PieceNames>,
    engine: GameEngine<PieceNames>,
    destination: BoardPosition,
    captureAvailability: CaptureAvailability
): boolean {
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

export function pieceIsOnPosition<PieceNames extends string[]>(
    piece: Piece<PieceNames>,
    position: BoardPosition
): boolean {
    return (
        piece.position[0] === position[0] && piece.position[1] === position[1]
    );
}
