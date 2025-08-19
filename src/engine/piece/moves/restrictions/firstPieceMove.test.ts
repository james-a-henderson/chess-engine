import { GameState, PiecePlacement } from '../../../gameState';
import { generateGameState } from '../../../gameState/generateGameState';
import { firstPieceMove } from './firstPieceMove';

type testPieceNames = ['foo'];

describe('firstPieceMove', () => {
    test('returns true if piece has not moved', () => {
        const state = generateTestState(0);

        const result = firstPieceMove(state, { piecePosition: ['a', 1] });
        expect(result).toEqual(true);
    });

    test('returns false if piece has moved once', () => {
        const state = generateTestState(1);

        const result = firstPieceMove(state, { piecePosition: ['a', 1] });
        expect(result).toEqual(false);
    });

    test('returns false if piece has moved three times', () => {
        const state = generateTestState(3);

        const result = firstPieceMove(state, { piecePosition: ['a', 1] });
        expect(result).toEqual(false);
    });
});

function generateTestState(moveCount: number): GameState<testPieceNames> {
    const piecePlacements: PiecePlacement<testPieceNames>[] = [
        {
            piece: { name: 'foo', color: 'white', moveCount: moveCount },
            position: ['a', 1]
        }
    ];

    return generateGameState(piecePlacements, 'white', { width: 8, height: 8 });
}
