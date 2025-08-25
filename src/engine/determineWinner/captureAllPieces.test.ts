import { RectangularBoardConfig } from '../../types';
import { PiecePlacement } from '../gameState';
import { generateGameState } from '../gameState/generateGameState';
import { allPlayerPiecesCaptured } from './captureAllPieces';

type pieceNames = ['foo'];
describe('captureAllPieces', () => {
    const boardConfig: RectangularBoardConfig = {
        width: 8,
        height: 8
    };

    test('returns white win if current player is black and black has no pieces', () => {
        const piecePlacements: PiecePlacement<pieceNames>[] = [
            {
                piece: { name: 'foo', color: 'white', moveCount: 1 },
                position: ['a', 3]
            },
            {
                piece: { name: 'foo', color: 'white', moveCount: 0 },
                position: ['f', 5]
            }
        ];

        const state = generateGameState(piecePlacements, 'black', boardConfig);

        const result = allPlayerPiecesCaptured(state);

        expect(result).toEqual({
            status: 'victory',
            winningPlayer: 'white'
        });
    });

    test('returns black win if current player is white and white has no pieces', () => {
        const piecePlacements: PiecePlacement<pieceNames>[] = [
            {
                piece: { name: 'foo', color: 'black', moveCount: 1 },
                position: ['a', 3]
            },
            {
                piece: { name: 'foo', color: 'black', moveCount: 0 },
                position: ['f', 5]
            }
        ];

        const state = generateGameState(piecePlacements, 'white', boardConfig);

        const result = allPlayerPiecesCaptured(state);

        expect(result).toEqual({
            status: 'victory',
            winningPlayer: 'black'
        });
    });

    test('returns in progress if both players have pieces and current player is white', () => {
        const piecePlacements: PiecePlacement<pieceNames>[] = [
            {
                piece: { name: 'foo', color: 'black', moveCount: 1 },
                position: ['a', 3]
            },
            {
                piece: { name: 'foo', color: 'white', moveCount: 0 },
                position: ['f', 5]
            }
        ];

        const state = generateGameState(piecePlacements, 'white', boardConfig);

        const result = allPlayerPiecesCaptured(state);

        expect(result).toEqual(false);
    });

    test('returns in progress if both players have pieces and current player is black', () => {
        const piecePlacements: PiecePlacement<pieceNames>[] = [
            {
                piece: { name: 'foo', color: 'black', moveCount: 1 },
                position: ['a', 3]
            },
            {
                piece: { name: 'foo', color: 'white', moveCount: 0 },
                position: ['f', 5]
            }
        ];

        const state = generateGameState(piecePlacements, 'black', boardConfig);

        const result = allPlayerPiecesCaptured(state);

        expect(result).toEqual(false);
    });
});
