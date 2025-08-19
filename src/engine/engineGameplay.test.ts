import { GameRules, IllegalMoveError, MoveRecord, PieceConfig } from '../types';
import { GameEngine } from './GameEngine';

const mockGenerateVerifyLegalMove = jest.fn();
const mockGenerateGetLegalMoves = jest.fn();

const mockGenerateCheckFunction = jest.fn();

jest.mock('./piece/moves', () => {
    return {
        generateVerifyLegalMoveFunction: () =>
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            mockGenerateVerifyLegalMove(),
        generateGetLegalMovesFunction: () =>
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            mockGenerateGetLegalMoves()
    };
});

jest.mock('./board', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...jest.requireActual('./board'),
        generateCheckFunction: () =>
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            mockGenerateCheckFunction()
    };
});

type testPieceNames = ['foo', 'bar', 'promotion'];
const testPiece: PieceConfig<testPieceNames> = {
    name: 'foo',
    displayCharacters: {
        white: 'F',
        black: 'f'
    },
    notation: 'F',
    moves: [
        {
            name: 'test',
            type: 'standard',
            directions: 'all',
            maxSpaces: 'unlimited',
            captureAvailability: 'optional'
        }
    ],
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

const testRecord: MoveRecord<testPieceNames> = {
    type: 'standard',
    moveName: 'test',
    pieceName: 'foo',
    pieceColor: 'white',
    originSpace: ['a', 1],
    destinationSpace: ['a', 2]
};

describe('GameEngine gameplay', () => {
    beforeEach(() => {
        mockGenerateVerifyLegalMove.mockReset();
        mockGenerateGetLegalMoves.mockReset();
        mockGenerateCheckFunction.mockReset();

        mockGenerateVerifyLegalMove.mockReturnValue(() => {
            return false;
        });
        mockGenerateGetLegalMoves.mockReturnValue(() => {
            return { moves: [], captureMoves: [], spacesThreatened: [] };
        });
        mockGenerateCheckFunction.mockReturnValue(() => {
            return false;
        });
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });
    describe('getSpace', () => {
        let engine: GameEngine<testPieceNames>;

        beforeEach(() => {
            mockGenerateVerifyLegalMove.mockReturnValue(() => {
                return testRecord;
            });
            engine = new GameEngine(testConfig);
        });

        test('returns correct space with coordinates', () => {
            const space = engine.getSpace(['a', 1]);

            expect(space).toEqual({
                piece: { color: 'white', moveCount: 0, name: 'foo' },
                position: ['a', 1]
            });
        });

        test('returns correct space with indicies', () => {
            const space = engine.getSpace([1, 7]);

            expect(space).toEqual({
                piece: { color: 'black', moveCount: 0, name: 'foo' },
                position: ['b', 8]
            });
        });

        test('space does not have piece after move', () => {
            engine.makeMove(['a', 1], ['a', 2]);

            const space = engine.getSpace(['a', 1]);
            expect(space).toEqual({
                piece: undefined,
                position: ['a', 1]
            });
        });
    });

    describe('verifyMove', () => {
        test('returns false if origin space does not have piece', () => {
            const engine = new GameEngine(testConfig);
            const result = engine.verifyMove(['a', 2], ['a', 3]);

            expect(result).toEqual(false);
        });

        test('returns false if origin space has piece of wrong color', () => {
            const engine = new GameEngine(testConfig);
            const result = engine.verifyMove(['a', 8], ['a', 7]);

            expect(result).toEqual(false);
        });

        test('returns false if piece has no associated verify move functions', () => {
            const pieceConfig: PieceConfig<testPieceNames> = {
                ...testPiece,
                moves: []
            };
            const rulesConfig: GameRules<testPieceNames> = {
                ...testConfig,
                pieces: [pieceConfig]
            };

            const engine = new GameEngine(rulesConfig);
            const result = engine.verifyMove(['a', 1], ['a', 2]);

            expect(result).toEqual(false);
        });

        test('returns false if verify move function returns false', () => {
            const engine = new GameEngine(testConfig);
            const result = engine.verifyMove(['a', 1], ['a', 2]);

            expect(result).toEqual(false);
        });

        test('returns MoveRecord if verify move function returns moveRecord', () => {
            mockGenerateVerifyLegalMove.mockReturnValue(() => {
                return testRecord;
            });

            const engine = new GameEngine(testConfig);
            const result = engine.verifyMove(['a', 1], ['a', 2]);

            expect(result).toEqual(testRecord);
        });

        describe('verifyPromotionRules', () => {
            const promotionPiece: PieceConfig<testPieceNames> = {
                name: 'promotion',
                displayCharacters: {
                    white: 'P',
                    black: 'p'
                },
                notation: 'P',
                moves: [
                    {
                        name: 'test',
                        type: 'standard',
                        directions: 'all',
                        maxSpaces: 'unlimited',
                        captureAvailability: 'optional'
                    }
                ],
                startingPositions: {
                    white: [['c', 1]],
                    black: [['d', 8]]
                },
                promotionConfig: {
                    promotionTargets: ['foo'],
                    promotionSquares: {
                        white: [
                            ['c', 8],
                            ['d', 8]
                        ],
                        black: [
                            ['d', 1],
                            ['c', 1]
                        ]
                    }
                }
            };

            const promotionRulesConfig: GameRules<testPieceNames> = {
                ...testConfig,
                pieces: [testPiece, promotionPiece]
            };

            const promotionRecord: MoveRecord<testPieceNames> = {
                type: 'standard',
                originSpace: ['c', 1],
                destinationSpace: ['c', 8],
                moveName: 'promotion',
                pieceColor: 'white',
                pieceName: 'promotion',
                promotedTo: 'foo'
            };

            test('returns false if destination is promotion space but no promotedTo is specified', () => {
                const testRecord: MoveRecord<testPieceNames> = {
                    ...promotionRecord,
                    promotedTo: undefined
                };

                mockGenerateVerifyLegalMove.mockReturnValue(() => {
                    return testRecord;
                });

                const engine = new GameEngine(promotionRulesConfig);
                const result = engine.verifyMove(['c', 1], ['c', 8]);

                expect(result).toEqual(false);
            });

            test('returns false if specified promotion target is invalid', () => {
                const testRecord: MoveRecord<testPieceNames> = {
                    ...promotionRecord,
                    promotedTo: 'bar'
                };

                mockGenerateVerifyLegalMove.mockReturnValue(() => {
                    return testRecord;
                });

                const engine = new GameEngine(promotionRulesConfig);
                const result = engine.verifyMove(['c', 1], ['c', 8]);

                expect(result).toEqual(false);
            });

            test('returns false if promotedTo is set but destination space is not promotion space', () => {
                const testRecord: MoveRecord<testPieceNames> = {
                    ...promotionRecord,
                    destinationSpace: ['c', 7]
                };

                mockGenerateVerifyLegalMove.mockReturnValue(() => {
                    return testRecord;
                });

                const engine = new GameEngine(promotionRulesConfig);
                const result = engine.verifyMove(['c', 1], ['c', 7]);

                expect(result).toEqual(false);
            });

            test('returns false if promotedTo is set but piece does not have promotion squares set for piece color', () => {
                const testPromotionPiece: PieceConfig<testPieceNames> = {
                    ...promotionPiece,
                    promotionConfig: {
                        promotionTargets: ['foo'],
                        promotionSquares: {
                            black: [['d', 1]]
                        }
                    }
                };

                const config: GameRules<testPieceNames> = {
                    ...promotionRulesConfig,
                    pieces: [testPiece, testPromotionPiece]
                };

                mockGenerateVerifyLegalMove.mockReturnValue(() => {
                    return promotionRecord;
                });

                const engine = new GameEngine(config);
                const result = engine.verifyMove(['c', 1], ['c', 8]);
                expect(result).toEqual(false);
            });

            test('returns false if promotedTo is set but piece does not have promotion configured', () => {
                const record: MoveRecord<testPieceNames> = {
                    ...testRecord,
                    promotedTo: 'bar'
                };

                mockGenerateVerifyLegalMove.mockReturnValue(() => {
                    return record;
                });

                const engine = new GameEngine(promotionRulesConfig);
                const result = engine.verifyMove(['a', 1], ['a', 2]);
                expect(result).toEqual(false);
            });

            test('returns true if promotion is valid', () => {
                mockGenerateVerifyLegalMove.mockReturnValue(() => {
                    return promotionRecord;
                });

                const engine = new GameEngine(promotionRulesConfig);
                const result = engine.verifyMove(['c', 1], ['c', 8]);

                expect(result).toEqual(promotionRecord);
            });
        });
    });

    describe('makeMove', () => {
        test('throws error if move is not valid', () => {
            jest.spyOn(GameEngine.prototype, 'verifyMove').mockReturnValueOnce(
                false
            );

            const engine = new GameEngine(testConfig);
            expect(() => {
                engine.makeMove(['a', 1], ['a', 2]);
            }).toThrow(IllegalMoveError);
        });

        test('throws error if verifyBoardFunction returns false', () => {
            const config: GameRules<testPieceNames> = {
                ...testConfig,
                winConditions: [
                    {
                        condition: 'checkmate',
                        checkmatePiece: 'bar'
                    }
                ]
            };

            jest.spyOn(GameEngine.prototype, 'verifyMove').mockReturnValueOnce(
                testRecord
            );
            const engine = new GameEngine(config);
            expect(() => {
                engine.makeMove(['a', 1], ['a', 2]);
            }).toThrow(IllegalMoveError);
        });

        test('updates player if move is valid', () => {
            jest.spyOn(GameEngine.prototype, 'verifyMove').mockReturnValueOnce(
                testRecord
            );
            const engine = new GameEngine(testConfig);
            engine.makeMove(['a', 1], ['a', 2]);

            expect(engine.currentPlayer).toEqual('black');
        });

        test('piece is not on origin space after move', () => {
            jest.spyOn(GameEngine.prototype, 'verifyMove').mockReturnValueOnce(
                testRecord
            );
            const engine = new GameEngine(testConfig);

            expect(engine.getSpace(['a', 1]).piece).not.toBeUndefined();

            engine.makeMove(['a', 1], ['a', 2]);
            expect(engine.getSpace(['a', 1]).piece).toBeUndefined();
        });

        test('piece is on destination space after move', () => {
            jest.spyOn(GameEngine.prototype, 'verifyMove').mockReturnValueOnce(
                testRecord
            );
            const engine = new GameEngine(testConfig);

            expect(engine.getSpace(['a', 2]).piece).toBeUndefined();

            engine.makeMove(['a', 1], ['a', 2]);

            expect(engine.getSpace(['a', 2]).piece).not.toBeUndefined();
        });

        test('piece move count is updated after move', () => {
            jest.spyOn(GameEngine.prototype, 'verifyMove').mockReturnValueOnce(
                testRecord
            );
            const engine = new GameEngine(testConfig);
            engine.makeMove(['a', 1], ['a', 2]);

            expect(engine.getSpace(['a', 2]).piece?.moveCount).toEqual(1);
        });

        test('does not throw error if verifyBoardFunction returns true', () => {
            const config: GameRules<testPieceNames> = {
                ...testConfig,
                winConditions: [
                    {
                        condition: 'checkmate',
                        checkmatePiece: 'bar'
                    }
                ]
            };

            mockGenerateCheckFunction.mockReturnValue(() => {
                return true;
            });
            jest.spyOn(GameEngine.prototype, 'verifyMove').mockReturnValueOnce(
                testRecord
            );
            const engine = new GameEngine(config);
            expect(() => {
                engine.makeMove(['a', 1], ['a', 2]);
            }).not.toThrow(IllegalMoveError);
        });
    });
});
