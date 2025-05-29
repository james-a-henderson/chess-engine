import { MoveRecord, PieceConfig } from '../../types';
import { GameEngine } from '../GameEngine';
import { Piece } from './piece';

const generateVerifyLegalMoveFunctionsMock = jest.fn();
const generateGetLegalMoveFunctionsMock = jest.fn();

jest.mock('./moves/verifyMove', () => {
    return {
        generateVerifyLegalMoveFunctions: () =>
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            generateVerifyLegalMoveFunctionsMock()
    };
});

jest.mock('./moves/getLegalMoves', () => {
    return {
        generateGetLegalMoveFunctions: () =>
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            generateGetLegalMoveFunctionsMock()
    };
});

type testPieceNames = ['foo'];

describe('piece', () => {
    const pieceConfig: PieceConfig<testPieceNames> = {
        name: 'foo',
        notation: 'F',
        displayCharacters: {
            white: 'F',
            black: 'f'
        },
        moves: [
            {
                type: 'standard',
                name: 'testMove',
                captureAvailability: 'optional',
                directions: ['forward'],
                maxSpaces: 'unlimited'
            }
        ],
        startingPositions: {
            white: [['a', 1]],
            black: [['a', 8]]
        }
    };

    const pieceConfigNoMoves: PieceConfig<testPieceNames> = {
        ...pieceConfig,
        moves: []
    };

    const boardConfig = {
        height: 8,
        width: 8
    };

    beforeEach(() => {
        generateVerifyLegalMoveFunctionsMock.mockReset();
        generateGetLegalMoveFunctionsMock.mockReset();
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });
    describe('getDisplayCharacter', () => {
        test('returns correct character when player is white', () => {
            const piece = new Piece(
                pieceConfigNoMoves,
                'white',
                ['a', 1],
                boardConfig
            );
            expect(piece.getDisplayCharacter()).toEqual('F');
        });

        test('returns correct character when player is black', () => {
            const piece = new Piece(
                pieceConfigNoMoves,
                'black',
                ['a', 8],
                boardConfig
            );
            expect(piece.getDisplayCharacter()).toEqual('f');
        });
    });

    describe('getLegalMoves', () => {
        beforeEach(() => {
            //we don't want to worry about this during these tests
            generateVerifyLegalMoveFunctionsMock.mockReturnValue([]);
        });

        test('returns no moves if piece has no moves', () => {
            const piece = new Piece(
                pieceConfigNoMoves,
                'white',
                ['a', 1],
                boardConfig
            );
            const result = piece.getLegalMoves(
                {} as GameEngine<testPieceNames>
            );
            expect(result).toEqual({
                moves: [],
                captureMoves: [],
                spacesThreatened: []
            });
        });

        test('returns no moves if getLegalMoves functions returns empty array', () => {
            generateGetLegalMoveFunctionsMock.mockReturnValue(() => {
                return {
                    moves: [],
                    captureMoves: [],
                    spacesThreatened: []
                };
            });
            const piece = new Piece(
                pieceConfig,
                'white',
                ['a', 1],
                boardConfig
            );
            const result = piece.getLegalMoves(
                {} as GameEngine<testPieceNames>
            );
            expect(result).toEqual({
                moves: [],
                captureMoves: [],
                spacesThreatened: []
            });
        });

        test('returns array with single value if getLegalMoves function returns single value', () => {
            generateGetLegalMoveFunctionsMock.mockReturnValue(() => {
                return {
                    moves: [['a', 3]],
                    captureMoves: [],
                    spacesThreatened: [['a', 3]]
                };
            });
            const piece = new Piece(
                pieceConfig,
                'white',
                ['a', 1],
                boardConfig
            );
            const result = piece.getLegalMoves(
                {} as GameEngine<testPieceNames>
            );
            expect(result).toEqual({
                moves: [['a', 3]],
                captureMoves: [],
                spacesThreatened: [['a', 3]]
            });
        });

        test('returns array with multiple values if piece has mulitple moves', () => {
            const config: PieceConfig<testPieceNames> = {
                ...pieceConfig,
                moves: [
                    {
                        type: 'standard',
                        name: 'test1',
                        captureAvailability: 'optional',
                        directions: ['forward'],
                        maxSpaces: 1
                    },
                    {
                        type: 'standard',
                        name: 'test2',
                        captureAvailability: 'optional',
                        directions: ['backward'],
                        maxSpaces: 1
                    }
                ]
            };
            generateGetLegalMoveFunctionsMock
                .mockReturnValueOnce(() => {
                    return {
                        moves: [['a', 3]],
                        captureMoves: [],
                        spacesThreatened: [['a', 3]]
                    };
                })
                .mockReturnValueOnce(() => {
                    return {
                        moves: [['a', 2]],
                        captureMoves: [],
                        spacesThreatened: [['a', 2]]
                    };
                });
            const piece = new Piece(config, 'white', ['a', 1], boardConfig);

            const result = piece.getLegalMoves(
                {} as GameEngine<testPieceNames>
            );
            expect(result.moves).toHaveLength(2);
            expect(result.moves).toContainEqual(['a', 3]);
            expect(result.moves).toContainEqual(['a', 2]);
            expect(result.captureMoves).toHaveLength(0);
            expect(result.spacesThreatened).toHaveLength(2);
            expect(result.spacesThreatened).toContainEqual(['a', 3]);
            expect(result.spacesThreatened).toContainEqual(['a', 2]);
        });
    });

    describe('hasLegalMove', () => {
        beforeEach(() => {
            //we don't want to worry about this during these tests
            generateVerifyLegalMoveFunctionsMock.mockReturnValue([]);
        });

        test('returns false with no moves', () => {
            const piece = new Piece(
                pieceConfigNoMoves,
                'white',
                ['a', 1],
                boardConfig
            );
            const result = piece.hasLegalMove({} as GameEngine<testPieceNames>);
            expect(result).toEqual(false);
        });

        test('returns false if getLegalMoves functions returns empty array', () => {
            generateGetLegalMoveFunctionsMock.mockReturnValue(() => {
                return {
                    moves: [],
                    captureMoves: [],
                    spacesThreatened: []
                };
            });
            const piece = new Piece(
                pieceConfig,
                'white',
                ['a', 1],
                boardConfig
            );
            const result = piece.hasLegalMove({} as GameEngine<testPieceNames>);
            expect(result).toEqual(false);
        });

        test('returns true if getLegalMoves function returns single value', () => {
            generateGetLegalMoveFunctionsMock.mockReturnValue(() => {
                return {
                    moves: [['a', 3]],
                    captureMoves: [],
                    spacesThreatened: [['a', 3]]
                };
            });
            const piece = new Piece(
                pieceConfig,
                'white',
                ['a', 1],
                boardConfig
            );
            const result = piece.hasLegalMove({} as GameEngine<testPieceNames>);
            expect(result).toEqual(true);
        });

        test('returns true if piece has mulitple moves that return values', () => {
            const config: PieceConfig<testPieceNames> = {
                ...pieceConfig,
                moves: [
                    {
                        type: 'standard',
                        name: 'test1',
                        captureAvailability: 'optional',
                        directions: ['forward'],
                        maxSpaces: 1
                    },
                    {
                        type: 'standard',
                        name: 'test2',
                        captureAvailability: 'optional',
                        directions: ['backward'],
                        maxSpaces: 1
                    }
                ]
            };
            generateGetLegalMoveFunctionsMock
                .mockReturnValueOnce(() => {
                    return {
                        moves: [['a', 3]],
                        captureMoves: [],
                        spacesThreatened: [['a', 3]]
                    };
                })
                .mockReturnValueOnce(() => {
                    return {
                        moves: [['a', 2]],
                        captureMoves: [],
                        spacesThreatened: [['a', 2]]
                    };
                });
            const piece = new Piece(config, 'white', ['a', 1], boardConfig);

            const result = piece.hasLegalMove({} as GameEngine<testPieceNames>);
            expect(result).toEqual(true);
        });

        test('returns true if piece has single move that returns values', () => {
            const config: PieceConfig<testPieceNames> = {
                ...pieceConfig,
                moves: [
                    {
                        type: 'standard',
                        name: 'test1',
                        captureAvailability: 'optional',
                        directions: ['forward'],
                        maxSpaces: 1
                    },
                    {
                        type: 'standard',
                        name: 'test2',
                        captureAvailability: 'optional',
                        directions: ['backward'],
                        maxSpaces: 1
                    }
                ]
            };
            generateGetLegalMoveFunctionsMock
                .mockReturnValueOnce(() => {
                    return {
                        moves: [],
                        captureMoves: [],
                        spacesThreatened: []
                    };
                })
                .mockReturnValueOnce(() => {
                    return {
                        moves: [['a', 3]],
                        captureMoves: [],
                        spacesThreatened: [['a', 3]]
                    };
                });
            const piece = new Piece(config, 'white', ['a', 1], boardConfig);

            const result = piece.hasLegalMove({} as GameEngine<testPieceNames>);
            expect(result).toEqual(true);
        });
    });

    describe('verifyMove', () => {
        const testMoveResult: MoveRecord<testPieceNames> = {
            destinationSpace: ['a', 4],
            originSpace: ['a', 1],
            moveName: 'test',
            pieceColor: 'white',
            pieceName: 'foo'
        };
        const legalMove = () => {
            return testMoveResult;
        };
        const illegalMove = () => {
            return false;
        };

        test('returns false with no moves', () => {
            const piece = new Piece(
                pieceConfigNoMoves,
                'white',
                ['a', 1],
                boardConfig
            );
            const result = piece.verifyMove({} as GameEngine<testPieceNames>, [
                'a',
                4
            ]);
            expect(result).toEqual(false);
        });

        test('returns true with one move that returns true', () => {
            generateVerifyLegalMoveFunctionsMock.mockReturnValue([legalMove]);
            const piece = new Piece(
                pieceConfig,
                'white',
                ['a', 1],
                boardConfig
            );
            const result = piece.verifyMove({} as GameEngine<testPieceNames>, [
                'a',
                4
            ]);
            expect(result).toEqual(testMoveResult);
        });

        test('returns false with one move that returns false', () => {
            generateVerifyLegalMoveFunctionsMock.mockReturnValue([illegalMove]);
            const piece = new Piece(
                pieceConfig,
                'white',
                ['a', 1],
                boardConfig
            );
            const result = piece.verifyMove({} as GameEngine<testPieceNames>, [
                'a',
                4
            ]);
            expect(result).toEqual(false);
        });

        test('returns true if only one move returns true', () => {
            generateVerifyLegalMoveFunctionsMock.mockReturnValue([
                illegalMove,
                illegalMove,
                legalMove
            ]);
            const piece = new Piece(
                pieceConfig,
                'white',
                ['a', 1],
                boardConfig
            );
            const result = piece.verifyMove({} as GameEngine<testPieceNames>, [
                'a',
                4
            ]);
            expect(result).toEqual(testMoveResult);
        });

        test('returns false if all moves return false', () => {
            generateVerifyLegalMoveFunctionsMock.mockReturnValue([
                illegalMove,
                illegalMove,
                illegalMove
            ]);
            const piece = new Piece(
                pieceConfig,
                'white',
                ['a', 1],
                boardConfig
            );
            const result = piece.verifyMove({} as GameEngine<testPieceNames>, [
                'a',
                4
            ]);
            expect(result).toEqual(false);
        });
    });

    describe('moveCount', () => {
        test('moveCount is initialized to 0', () => {
            const piece = new Piece(
                pieceConfigNoMoves,
                'white',
                ['a', 1],
                boardConfig
            );
            expect(piece.moveCount).toEqual(0);
        });

        test('moveCount is 1 after one move', () => {
            const piece = new Piece(
                pieceConfigNoMoves,
                'white',
                ['a', 1],
                boardConfig
            );

            piece.position = ['a', 2];
            expect(piece.moveCount).toEqual(1);
        });

        test('moveCount is 3 after three moves', () => {
            const piece = new Piece(
                pieceConfigNoMoves,
                'white',
                ['a', 1],
                boardConfig
            );

            piece.position = ['a', 2];
            piece.position = ['a', 3];
            piece.position = ['a', 4];

            expect(piece.moveCount).toEqual(3);
        });
    });
});
