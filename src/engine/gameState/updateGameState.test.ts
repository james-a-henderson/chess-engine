import { MoveRecord } from '../../types';
import { GameState } from './gameState';
import { updateGameState } from './updateGameState';

type pieceNames = ['foo'];

describe('updateGameState', () => {
    test('Input Game state is not changed', () => {
        const state: GameState<pieceNames> = {
            currentPlayer: 'white',
            status: { status: 'inProgress' },
            boardConfig: { width: 2, height: 2 },
            board: [
                [
                    {
                        position: ['a', 1],
                        piece: { color: 'white', moveCount: 0, name: 'foo' }
                    },
                    { position: ['b', 1], piece: undefined }
                ],
                [
                    {
                        position: ['a', 2],
                        piece: { color: 'black', moveCount: 0, name: 'foo' }
                    },
                    { position: ['b', 2], piece: undefined }
                ]
            ]
        };

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
        expect(state.board[0][1].piece).toBeUndefined();
    });

    describe('Basic move', () => {
        const state: GameState<pieceNames> = {
            currentPlayer: 'white',
            status: { status: 'inProgress' },
            boardConfig: { width: 2, height: 2 },
            board: [
                [
                    {
                        position: ['a', 1],
                        piece: { color: 'white', moveCount: 0, name: 'foo' }
                    },
                    { position: ['b', 1], piece: undefined }
                ],
                [
                    {
                        position: ['a', 2],
                        piece: { color: 'black', moveCount: 0, name: 'foo' }
                    },
                    { position: ['b', 2], piece: undefined }
                ]
            ]
        };

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
});
