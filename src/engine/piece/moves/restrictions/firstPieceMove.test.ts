import { PieceConfig } from '../../../../types';
import { Piece } from '../../piece';
import { firstPieceMove } from './firstPieceMove';

type testPieceNames = ['foo'];

describe('firstPieceMove', () => {
    const pieceConfig: PieceConfig<testPieceNames> = {
        name: 'foo',
        notation: 'F',
        displayCharacters: {
            white: 'F',
            black: 'f'
        },
        moves: [],
        startingPositions: {
            white: [['a', 1]],
            black: [['a', 8]]
        }
    };

    test('returns true if piece has not moved', () => {
        const piece = new Piece(pieceConfig, 'white');

        const result = firstPieceMove(piece);
        expect(result).toEqual(true);
    });

    test('returns false if piece has moved once', () => {
        const piece = new Piece(pieceConfig, 'white');

        piece.increaseMoveCount();

        const result = firstPieceMove(piece);
        expect(result).toEqual(false);
    });

    test('returns false if piece has moved three times', () => {
        const piece = new Piece(pieceConfig, 'white');

        piece.increaseMoveCount();
        piece.increaseMoveCount();
        piece.increaseMoveCount();

        const result = firstPieceMove(piece);
        expect(result).toEqual(false);
    });
});
