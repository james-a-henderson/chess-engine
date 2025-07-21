import { MoveRecord, RectangularBoardConfig } from '../../types';
import { rectangularBoardHelper } from '../board';
import { GameStatePiecePlacement } from './gameState';
import { generateGameState } from './generateGameState';
import { updateGameState } from './updateGameState';

type pieceNames = ['foo', 'bar'];

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
        expect(
            rectangularBoardHelper.getSpace(state, ['a', 1]).piece?.color
        ).toEqual('white');
        expect(
            rectangularBoardHelper.getSpace(state, ['a', 1]).piece?.name
        ).toEqual('foo');
        expect(
            rectangularBoardHelper.getSpace(state, ['b', 1]).piece
        ).toBeUndefined();
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
            expect(
                rectangularBoardHelper.getSpace(result, ['b', 1]).piece?.color
            ).toEqual('white');
            expect(
                rectangularBoardHelper.getSpace(result, ['b', 1]).piece?.name
            ).toEqual('foo');
        });

        test('Piece move count is updated', () => {
            expect(
                rectangularBoardHelper.getSpace(result, ['b', 1]).piece
                    ?.moveCount
            ).toEqual(1);
        });

        test('Piece moved off of starting space', () => {
            expect(
                rectangularBoardHelper.getSpace(result, ['a', 1]).piece
            ).toBeUndefined();
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
            expect(
                rectangularBoardHelper.getSpace(result, ['a', 2]).piece?.color
            ).toEqual('white');
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

    test('Promotion move updates piece name', () => {
        const piecePlacements: GameStatePiecePlacement<pieceNames>[] = [
            {
                piece: { color: 'white', moveCount: 0, name: 'foo' },
                position: ['a', 1]
            }
        ];
        const state = generateGameState(piecePlacements, 'white', boardConfig);

        const move: MoveRecord<pieceNames> = {
            type: 'standard',
            originSpace: ['a', 1],
            destinationSpace: ['b', 1],
            moveName: 'test',
            pieceColor: 'white',
            pieceName: 'foo',
            promotedTo: 'bar'
        };

        const result = updateGameState(state, move);

        expect(
            rectangularBoardHelper.getSpace(result, ['b', 1]).piece?.name
        ).toEqual('bar');
    });
});
