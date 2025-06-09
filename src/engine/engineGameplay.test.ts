import { GameRules, IllegalMoveError, MoveRecord, PieceConfig } from '../types';
import { GameEngine } from './GameEngine';
import { Piece } from './piece';

type testPieceNames = ['foo', 'king', 'rook'];
const testPiece: PieceConfig<testPieceNames> = {
    name: 'foo',
    displayCharacters: {
        white: 'F',
        black: 'f'
    },
    notation: 'F',
    moves: [],
    startingPositions: {
        white: [
            ['a', 1],
            ['b', 1]
        ],
        black: [
            ['a', 8],
            ['b', 8]
        ]
    }
};
const testConfig: GameRules<testPieceNames> = {
    name: 'test',
    players: [
        {
            color: 'white',
            order: 0
        },
        {
            color: 'black',
            order: 1
        }
    ],
    board: {
        height: 8,
        width: 8
    },
    winConditions: [],
    drawConditions: [],
    pieces: [testPiece]
};

describe('GameEngine gameplay', () => {
    afterAll(() => {
        jest.restoreAllMocks();
    });

    describe('verifyMove', () => {
        let engine: GameEngine<testPieceNames>;

        beforeEach(() => {
            engine = new GameEngine(testConfig);
        });

        test('returns false if target space does not have a piece', () => {
            expect(engine.verifyMove(['d', 5], ['a', 3])).toEqual(false);
        });

        test('returns false if piece color does not match current player color', () => {
            expect(engine.verifyMove(['a', 8], ['a', 7])).toEqual(false);
        });

        test('returns false if target piece verifyMove function returns false', () => {
            jest.spyOn(Piece.prototype, 'verifyMove').mockReturnValueOnce(
                false
            );
            expect(engine.verifyMove(['a', 1], ['a', 2])).toEqual(false);
        });

        test('returns MoveRecord if target piece verifyMove function returns MoveRecord', () => {
            const moveRecord: MoveRecord<testPieceNames> = {
                destinationSpace: ['a', 2],
                originSpace: ['a', 1],
                pieceColor: 'white',
                pieceName: 'foo',
                moveName: 'test',
                type: 'standard'
            };
            jest.spyOn(Piece.prototype, 'verifyMove').mockReturnValueOnce(
                moveRecord
            );
            expect(engine.verifyMove(['a', 1], ['a', 2])).toEqual(moveRecord);
        });
    });

    describe('makeMove', () => {
        test('throws error if move is not valid', () => {
            const engine = new GameEngine(testConfig);
            expect(() => {
                engine.makeMove(['d', 5], ['a', 4]);
            }).toThrow(IllegalMoveError);
        });

        describe('standard and jump moves', () => {
            let engine: GameEngine<testPieceNames>;

            beforeEach(() => {
                engine = new GameEngine(testConfig);
            });
            test('destination space contains piece after move', () => {
                jest.spyOn(Piece.prototype, 'verifyMove').mockReturnValueOnce({
                    destinationSpace: ['a', 2],
                    originSpace: ['a', 1],
                    pieceColor: 'white',
                    pieceName: 'foo',
                    moveName: 'test',
                    type: 'standard'
                });

                expect(engine.getSpace(['a', 2]).piece).toBeUndefined();

                engine.makeMove(['a', 1], ['a', 2]);

                expect(engine.getSpace(['a', 2]).piece?.pieceName).toEqual(
                    'foo'
                );
                expect(engine.getSpace(['a', 2]).piece?.playerColor).toEqual(
                    'white'
                );
            });

            test('original space does not contain piece after move', () => {
                jest.spyOn(Piece.prototype, 'verifyMove').mockReturnValueOnce({
                    destinationSpace: ['a', 2],
                    originSpace: ['a', 1],
                    pieceColor: 'white',
                    pieceName: 'foo',
                    moveName: 'test',
                    type: 'standard'
                });
                expect(engine.getSpace(['a', 1]).piece?.pieceName).toEqual(
                    'foo'
                );
                expect(engine.getSpace(['a', 1]).piece?.playerColor).toEqual(
                    'white'
                );

                engine.makeMove(['a', 1], ['a', 2]);

                expect(engine.getSpace(['a', 1]).piece).toBeUndefined();
            });

            test('destination space contains piece after capture move', () => {
                jest.spyOn(Piece.prototype, 'verifyMove').mockReturnValueOnce({
                    destinationSpace: ['a', 8],
                    originSpace: ['a', 1],
                    pieceColor: 'white',
                    pieceName: 'foo',
                    moveName: 'test',
                    type: 'standard'
                });

                expect(engine.getSpace(['a', 8]).piece?.pieceName).toEqual(
                    'foo'
                );
                expect(engine.getSpace(['a', 8]).piece?.playerColor).toEqual(
                    'black'
                );

                engine.makeMove(['a', 1], ['a', 8]);

                expect(engine.getSpace(['a', 8]).piece?.pieceName).toEqual(
                    'foo'
                );
                expect(engine.getSpace(['a', 8]).piece?.playerColor).toEqual(
                    'white'
                );
            });

            test('captured piece added to capturedPieces after capture', () => {
                jest.spyOn(Piece.prototype, 'verifyMove').mockReturnValueOnce({
                    destinationSpace: ['a', 8],
                    originSpace: ['a', 1],
                    pieceColor: 'white',
                    pieceName: 'foo',
                    moveName: 'test',
                    type: 'standard'
                });

                expect(engine.capturedPieces.black).toHaveLength(0);

                engine.makeMove(['a', 1], ['a', 8]);

                expect(engine.capturedPieces.black).toHaveLength(1);
                expect(engine.capturedPieces.black![0]).toEqual('foo');
            });

            test("Update piece's internal move count after move", () => {
                jest.spyOn(Piece.prototype, 'verifyMove').mockReturnValueOnce({
                    destinationSpace: ['a', 8],
                    originSpace: ['a', 1],
                    pieceColor: 'white',
                    pieceName: 'foo',
                    moveName: 'test',
                    type: 'standard'
                });

                const piece = engine.getSpace(['a', 1]).piece;
                expect(piece?.moveCount).toEqual(0);
                engine.makeMove(['a', 1], ['a', 8]);
                expect(piece?.moveCount).toEqual(1);
            });
        });

        describe('castle move', () => {
            let engine: GameEngine<testPieceNames>;

            const kingConfig: PieceConfig<testPieceNames> = {
                name: 'king',
                moves: [],
                notation: 'K',
                displayCharacters: {
                    white: '♔',
                    black: '♚'
                },
                startingPositions: {
                    white: [['e', 1]],
                    black: [['e', 8]]
                }
            };

            const rookConfig: PieceConfig<testPieceNames> = {
                name: 'rook',
                moves: [],
                notation: 'R',
                displayCharacters: {
                    white: '♖',
                    black: '♜'
                },
                startingPositions: {
                    white: [['h', 1]],
                    black: [['a', 8]]
                }
            };

            const castleConfig: GameRules<testPieceNames> = {
                ...testConfig,
                pieces: [kingConfig, rookConfig]
            };

            beforeEach(() => {
                engine = new GameEngine(castleConfig);
            });

            test('Castling pieces are in correct position after castle move', () => {
                jest.spyOn(Piece.prototype, 'verifyMove').mockReturnValueOnce({
                    destinationSpace: ['g', 1],
                    originSpace: ['e', 1],
                    pieceColor: 'white',
                    pieceName: 'king',
                    moveName: 'castleTest',
                    type: 'castle',
                    castleTarget: {
                        pieceName: 'rook',
                        destinationSpace: ['f', 1],
                        originSpace: ['h', 1]
                    }
                });

                expect(engine.getSpace(['f', 1]).piece).toBeUndefined();
                expect(engine.getSpace(['g', 1]).piece).toBeUndefined();

                engine.makeMove(['e', 1], ['g', 1], { type: 'castle' });

                expect(engine.getSpace(['g', 1]).piece?.pieceName).toEqual(
                    'king'
                );
                expect(engine.getSpace(['g', 1]).piece?.playerColor).toEqual(
                    'white'
                );

                expect(engine.getSpace(['f', 1]).piece?.pieceName).toEqual(
                    'rook'
                );
                expect(engine.getSpace(['f', 1]).piece?.playerColor).toEqual(
                    'white'
                );
            });

            test('Castling pieces origin spaces do not contain piece after move', () => {
                jest.spyOn(Piece.prototype, 'verifyMove').mockReturnValueOnce({
                    destinationSpace: ['g', 1],
                    originSpace: ['e', 1],
                    pieceColor: 'white',
                    pieceName: 'king',
                    moveName: 'castleTest',
                    type: 'castle',
                    castleTarget: {
                        pieceName: 'rook',
                        destinationSpace: ['f', 1],
                        originSpace: ['h', 1]
                    }
                });

                engine.makeMove(['e', 1], ['g', 1], { type: 'castle' });

                expect(engine.getSpace(['e', 1]).piece).toBeUndefined();
                expect(engine.getSpace(['h', 1]).piece).toBeUndefined();
            });

            test('Castling pieces are in correct position after castle move when pieces swap places', () => {
                jest.spyOn(Piece.prototype, 'verifyMove').mockReturnValueOnce({
                    destinationSpace: ['h', 1],
                    originSpace: ['e', 1],
                    pieceColor: 'white',
                    pieceName: 'king',
                    moveName: 'castleTest',
                    type: 'castle',
                    castleTarget: {
                        pieceName: 'rook',
                        destinationSpace: ['e', 1],
                        originSpace: ['h', 1]
                    }
                });

                engine.makeMove(['e', 1], ['h', 1], { type: 'castle' });

                expect(engine.getSpace(['h', 1]).piece?.pieceName).toEqual(
                    'king'
                );
                expect(engine.getSpace(['h', 1]).piece?.playerColor).toEqual(
                    'white'
                );

                expect(engine.getSpace(['e', 1]).piece?.pieceName).toEqual(
                    'rook'
                );
                expect(engine.getSpace(['e', 1]).piece?.playerColor).toEqual(
                    'white'
                );
            });
        });
    });

    describe('updateCurrentPlayer', () => {
        let engine: GameEngine<testPieceNames>;

        beforeEach(() => {
            engine = new GameEngine(testConfig);
        });
        test('current player starts as white', () => {
            expect(engine.currentPlayer).toEqual('white');
        });

        test('current player is black after one move', () => {
            jest.spyOn(Piece.prototype, 'verifyMove').mockReturnValueOnce({
                destinationSpace: ['a', 2],
                originSpace: ['a', 1],
                pieceColor: 'white',
                pieceName: 'foo',
                moveName: 'test',
                type: 'standard'
            });
            engine.makeMove(['a', 1], ['a', 2]);
            expect(engine.currentPlayer).toEqual('black');
        });

        test('current player is white after two moves', () => {
            jest.spyOn(Piece.prototype, 'verifyMove').mockReturnValueOnce({
                destinationSpace: ['a', 2],
                originSpace: ['a', 1],
                pieceColor: 'white',
                pieceName: 'foo',
                moveName: 'test',
                type: 'standard'
            });
            engine.makeMove(['a', 1], ['a', 2]);
            jest.spyOn(Piece.prototype, 'verifyMove').mockReturnValueOnce({
                destinationSpace: ['a', 3],
                originSpace: ['a', 8],
                pieceColor: 'black',
                pieceName: 'foo',
                moveName: 'test',
                type: 'standard'
            });
            engine.makeMove(['a', 8], ['a', 3]);

            expect(engine.currentPlayer).toEqual('white');
        });
    });

    describe('moves', () => {
        let engine: GameEngine<testPieceNames>;

        const firstMoveRecord: MoveRecord<testPieceNames> = {
            destinationSpace: ['a', 2],
            originSpace: ['a', 1],
            pieceColor: 'white',
            pieceName: 'foo',
            moveName: 'test',
            type: 'standard'
        };

        const secondMoveRecord: MoveRecord<testPieceNames> = {
            destinationSpace: ['a', 7],
            originSpace: ['a', 8],
            pieceColor: 'black',
            pieceName: 'foo',
            moveName: 'test',
            type: 'standard'
        };

        const thridMoveRecord: MoveRecord<testPieceNames> = {
            destinationSpace: ['a', 4],
            originSpace: ['a', 2],
            pieceColor: 'white',
            pieceName: 'foo',
            moveName: 'test',
            type: 'standard'
        };

        beforeEach(() => {
            engine = new GameEngine(testConfig);
        });

        test('moves is empty array when engine is initialized', () => {
            expect(engine.moves).toHaveLength(0);
        });

        test('moves contains one move after single move', () => {
            jest.spyOn(Piece.prototype, 'verifyMove').mockReturnValueOnce(
                firstMoveRecord
            );

            engine.makeMove(['a', 1], ['a', 2]);

            expect(engine.moves).toHaveLength(1);
            expect(engine.moves[0]).toEqual(firstMoveRecord);
        });

        test('last move contains expected move after single move', () => {
            jest.spyOn(Piece.prototype, 'verifyMove').mockReturnValueOnce(
                firstMoveRecord
            );

            engine.makeMove(['a', 1], ['a', 2]);

            expect(engine.lastMove).toEqual(firstMoveRecord);
        });

        test('moves contains 3 moves after three moves made', () => {
            jest.spyOn(Piece.prototype, 'verifyMove').mockReturnValueOnce(
                firstMoveRecord
            );
            engine.makeMove(['a', 1], ['a', 2]);
            jest.spyOn(Piece.prototype, 'verifyMove').mockReturnValueOnce(
                secondMoveRecord
            );
            engine.makeMove(['a', 8], ['a', 7]);
            jest.spyOn(Piece.prototype, 'verifyMove').mockReturnValueOnce(
                thridMoveRecord
            );
            engine.makeMove(['a', 2], ['a', 4]);

            expect(engine.moves).toEqual([
                firstMoveRecord,
                secondMoveRecord,
                thridMoveRecord
            ]);
        });

        test('last move contains expected move after three moves', () => {
            jest.spyOn(Piece.prototype, 'verifyMove').mockReturnValueOnce(
                firstMoveRecord
            );
            engine.makeMove(['a', 1], ['a', 2]);
            jest.spyOn(Piece.prototype, 'verifyMove').mockReturnValueOnce(
                secondMoveRecord
            );
            engine.makeMove(['a', 8], ['a', 7]);
            jest.spyOn(Piece.prototype, 'verifyMove').mockReturnValueOnce(
                thridMoveRecord
            );
            engine.makeMove(['a', 2], ['a', 4]);

            expect(engine.lastMove).toEqual(thridMoveRecord);
        });
    });
});
