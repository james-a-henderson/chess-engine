import { GameError, MoveRecord, RectangularBoardConfig } from '../../types';
import { rectangularBoardHelper } from '../board';
import { GameState, GameStatePiecePlacement } from './gameState';
import { generateGameState } from './generateGameState';
import { updateGameState } from './updateGameState';

type pieceNames = ['foo', 'bar'];

describe('updateGameState', () => {
    const smallBoardConfig: RectangularBoardConfig = { width: 2, height: 2 };
    const standardBoardConfig: RectangularBoardConfig = { width: 8, height: 8 };
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
        const state = generateGameState(
            piecePlacements,
            'white',
            smallBoardConfig
        );

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
        const state = generateGameState(
            piecePlacements,
            'white',
            smallBoardConfig
        );

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

    describe('castle move', () => {
        const piecePlacements: GameStatePiecePlacement<pieceNames>[] = [
            {
                piece: { color: 'white', moveCount: 0, name: 'foo' },
                position: ['e', 1]
            },
            {
                piece: { color: 'white', moveCount: 0, name: 'bar' },
                position: ['a', 1]
            },
            {
                piece: { color: 'white', moveCount: 0, name: 'bar' },
                position: ['h', 1]
            }
        ];
        let state: GameState<pieceNames>;

        beforeEach(() => {
            state = generateGameState(
                piecePlacements,
                'white',
                standardBoardConfig
            );
        });

        test('Castling pieces are in correct position after castle move', () => {
            const move: MoveRecord<pieceNames> = {
                type: 'castle',
                originSpace: ['e', 1],
                destinationSpace: ['g', 1],
                pieceColor: 'white',
                pieceName: 'foo',
                moveName: 'castleTest',
                castleTarget: {
                    pieceName: 'bar',
                    originSpace: ['h', 1],
                    destinationSpace: ['f', 1]
                }
            };

            const result = updateGameState(state, move);

            expect(
                rectangularBoardHelper.getSpace(result, ['g', 1]).piece?.name
            ).toEqual('foo');
            expect(
                rectangularBoardHelper.getSpace(result, ['f', 1]).piece?.name
            ).toEqual('bar');
        });

        test('Castling pieces have updated move count', () => {
            const move: MoveRecord<pieceNames> = {
                type: 'castle',
                originSpace: ['e', 1],
                destinationSpace: ['g', 1],
                pieceColor: 'white',
                pieceName: 'foo',
                moveName: 'castleTest',
                castleTarget: {
                    pieceName: 'bar',
                    originSpace: ['h', 1],
                    destinationSpace: ['f', 1]
                }
            };

            const result = updateGameState(state, move);

            expect(
                rectangularBoardHelper.getSpace(result, ['g', 1]).piece
                    ?.moveCount
            ).toEqual(1);
            expect(
                rectangularBoardHelper.getSpace(result, ['f', 1]).piece
                    ?.moveCount
            ).toEqual(1);
        });

        test('Castling pieces are in correct position after castle move when pieces swap spaces', () => {
            const move: MoveRecord<pieceNames> = {
                type: 'castle',
                originSpace: ['e', 1],
                destinationSpace: ['a', 1],
                pieceColor: 'white',
                pieceName: 'foo',
                moveName: 'castleTest',
                castleTarget: {
                    pieceName: 'bar',
                    originSpace: ['a', 1],
                    destinationSpace: ['e', 1]
                }
            };

            const result = updateGameState(state, move);

            expect(
                rectangularBoardHelper.getSpace(result, ['a', 1]).piece?.name
            ).toEqual('foo');
            expect(
                rectangularBoardHelper.getSpace(result, ['e', 1]).piece?.name
            ).toEqual('bar');
        });

        test('Throws error if target piece is not on its origin space', () => {
            const move: MoveRecord<pieceNames> = {
                type: 'castle',
                originSpace: ['e', 1],
                destinationSpace: ['g', 1],
                pieceColor: 'white',
                pieceName: 'foo',
                moveName: 'castleTest',
                castleTarget: {
                    pieceName: 'bar',
                    originSpace: ['g', 1],
                    destinationSpace: ['f', 1]
                }
            };

            expect(() => updateGameState(state, move)).toThrow(GameError);
        });
    });

    describe('capture move', () => {
        describe('normal capture location', () => {
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
            const state = generateGameState(
                piecePlacements,
                'white',
                smallBoardConfig
            );

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
                    rectangularBoardHelper.getSpace(result, ['a', 2]).piece
                        ?.color
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

        describe('alternate capture location', () => {
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
            const state = generateGameState(
                piecePlacements,
                'white',
                smallBoardConfig
            );

            const move: MoveRecord<pieceNames> = {
                type: 'standard',
                originSpace: ['a', 1],
                destinationSpace: ['b', 1],
                moveName: 'test',
                pieceColor: 'white',
                pieceName: 'foo',
                altCaptureLocation: ['a', 2]
            };

            const result = updateGameState(state, move);

            test('Moved piece is in destination space', () => {
                expect(
                    rectangularBoardHelper.getSpace(result, ['b', 1]).piece
                        ?.color
                ).toEqual('white');
            });

            test('Piece in alternate capture space has been captured', () => {
                expect(
                    rectangularBoardHelper.getSpace(result, ['a', 2]).piece
                ).toBeUndefined();
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

    test('Promotion move updates piece name', () => {
        const piecePlacements: GameStatePiecePlacement<pieceNames>[] = [
            {
                piece: { color: 'white', moveCount: 0, name: 'foo' },
                position: ['a', 1]
            }
        ];
        const state = generateGameState(
            piecePlacements,
            'white',
            smallBoardConfig
        );

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
