import { MoveRecord, RectangularBoardConfig } from '../../types';
import { GameStatePiecePlacement } from './gameState';
import { generateGameState } from './generateGameState';
import { updateGameState } from './updateGameState';

type pieceNames = ['foo'];

describe('updateGameState', () => {
    const boardConfig: RectangularBoardConfig = { width: 2, height: 2 };
    test('Input Game state is not changed', () => {
        const piecePlacements: GameStatePiecePlacement<pieceNames>[] = [
            {
                piece: { color: 'white', moveCount: 0, name: 'foo' },
                position: ['a', 1]
            },
            {
                piece: { color: 'black', moveCount: 0, name: 'foo' },
                position: ['a', 2]
            }
        ];
        const state = generateGameState(piecePlacements, 'white', boardConfig);

        updateGameState(state, {
            type: 'standard',
            originSpace: ['a', 1],
            destinationSpace: ['b', 1],
            moveName: 'test',
            pieceColor: 'white',
            pieceName: 'foo'
        });

        //this test *probably* isn't necessary, but I want to make doubly sure that the input isn't changed and deep copy is properly used
        expect(state.currentPlayer).toEqual('white');
        expect(state.lastMove).toBeUndefined();
        expect(state.board[0][0].piece?.color).toEqual('white');
        expect(state.board[0][0].piece?.name).toEqual('foo');
        expect(state.board[1][0].piece).toBeUndefined();
    });

    describe('Basic move', () => {
        const piecePlacements: GameStatePiecePlacement<pieceNames>[] = [
            {
                piece: { color: 'white', moveCount: 0, name: 'foo' },
                position: ['a', 1]
            },
            {
                piece: { color: 'black', moveCount: 0, name: 'foo' },
                position: ['a', 2]
            }
        ];
        const state = generateGameState(piecePlacements, 'white', boardConfig);

        const move: MoveRecord<pieceNames> = {
            type: 'standard',
            originSpace: ['a', 1],
            destinationSpace: ['b', 1],
            moveName: 'test',
            pieceColor: 'white',
            pieceName: 'foo'
        };

        const result = updateGameState(state, move);

        test('updates current player', () => {
            expect(result.currentPlayer).toEqual('black');
        });

        test('lastMove matches input move', () => {
            expect(result.lastMove).toEqual(move);
        });

        test('Piece is in destination space', () => {
            expect(result.board[1][0].piece?.color).toEqual('white');
            expect(result.board[1][0].piece?.name).toEqual('foo');
        });

        test('Piece move count is updated', () => {
            expect(result.board[1][0].piece?.moveCount).toEqual(1);
        });

        test('Piece moved off of starting space', () => {
            expect(result.board[0][0].piece).toBeUndefined();
        });
    });

    describe('basic capture move', () => {
        const piecePlacements: GameStatePiecePlacement<pieceNames>[] = [
            {
                piece: { color: 'white', moveCount: 0, name: 'foo' },
                position: ['a', 1]
            },
            {
                piece: { color: 'black', moveCount: 0, name: 'foo' },
                position: ['a', 2]
            }
        ];
        const state = generateGameState(piecePlacements, 'white', boardConfig);

        const move: MoveRecord<pieceNames> = {
            type: 'standard',
            originSpace: ['a', 1],
            destinationSpace: ['a', 2],
            moveName: 'test',
            pieceColor: 'white',
            pieceName: 'foo'
        };

        const result = updateGameState(state, move);

        test('Moved piece is in destination space', () => {
            expect(result.board[0][1].piece?.color).toEqual('white');
        });

        test('Captured piece is recorded', () => {
            expect(result.capturedPieces.black).toHaveLength(1);
            expect(result.capturedPieces.black[0]).toEqual({
                name: 'foo',
                moveCount: 0,
                color: 'black'
            });
        });
    });
});
