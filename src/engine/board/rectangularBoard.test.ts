import {
    BoardConfigurationError,
    BoardPosition,
    InvalidSpaceError,
    PieceConfig,
    PieceConfigurationError,
    RectangularBoardConfig
} from '../../types';
import { Piece } from '../piece';
import { RectangularBoard } from './rectangularBoard';

type testPieceNames = ['foo', 'bar', 'baz'];

describe('RectangularBoard', () => {
    const testBoardConfig: RectangularBoardConfig = {
        width: 3,
        height: 3
    };

    const testPieceFooConfig: PieceConfig<testPieceNames> = {
        name: 'foo',
        notation: 'F',
        displayCharacters: {
            white: 'F',
            black: 'f'
        },
        moves: [],
        startingPositions: {}
    };

    const testPieceBarConfig: PieceConfig<testPieceNames> = {
        name: 'bar',
        notation: 'B',
        displayCharacters: {
            white: 'B',
            black: 'b'
        },
        moves: [],
        startingPositions: {}
    };

    const testPieceBazConfig: PieceConfig<testPieceNames> = {
        name: 'baz',
        notation: 'Z',
        displayCharacters: {
            white: 'Z',
            black: 'z'
        },
        moves: [],
        startingPositions: {}
    };

    let testPieceFoo: Piece<testPieceNames>;
    let testPieceBar: Piece<testPieceNames>;
    let testPieceWhiteBaz: Piece<testPieceNames>;
    let testPieceBlackBaz: Piece<testPieceNames>;

    beforeEach(() => {
        testPieceFoo = new Piece(testPieceFooConfig, 'white', testBoardConfig);
        testPieceBar = new Piece(testPieceBarConfig, 'black', testBoardConfig);
        testPieceWhiteBaz = new Piece(
            testPieceBazConfig,
            'white',
            testBoardConfig
        );
        testPieceBlackBaz = new Piece(
            testPieceBazConfig,
            'black',
            testBoardConfig
        );
    });

    describe('constructor', () => {
        test.each([
            [8, 8],
            [1, 1],
            [702, 702],
            [18, 45]
        ])(
            'board with width %d and height %d generates board of correct size',
            (width, height) => {
                const config: RectangularBoardConfig = {
                    width: width,
                    height: height
                };

                const board = new RectangularBoard(config, []).spaces;
                expect(board.length).toEqual(width);
                board.forEach((file) => {
                    expect(file.length).toEqual(height);
                });
            }
        );

        test.each([
            [0, 1],
            [1, 0],
            [0, 0],
            [NaN, 10],
            [8, NaN],
            [NaN, NaN],
            [-4, 3],
            [5, -10],
            [-2, -5],
            [2.3, 5],
            [4, 4.3],
            [6.6, 7.7],
            [Infinity, 2],
            [4, Infinity],
            [Number.MAX_SAFE_INTEGER + 1, 5],
            [1024, 1024]
        ])(
            'board with width %d and height %d throws an error',
            (width, height) => {
                const config: RectangularBoardConfig = {
                    width: width,
                    height: height
                };

                expect(() => new RectangularBoard(config, [])).toThrow(
                    BoardConfigurationError
                );
            }
        );

        describe('placing pieces', () => {
            test('Pieces are placed on expected positions', () => {
                const piecePlacements = [
                    {
                        piece: testPieceFoo,
                        position: ['a', 1] as BoardPosition
                    },
                    { piece: testPieceBar, position: ['c', 3] as BoardPosition }
                ];
                const board = new RectangularBoard(
                    testBoardConfig,
                    piecePlacements
                );

                expect(board.getSpace(['a', 1]).piece?.pieceName).toEqual(
                    'foo'
                );
                expect(board.getSpace(['c', 3]).piece?.pieceName).toEqual(
                    'bar'
                );
            });

            test("Pieces are not placed on positions that aren't specified", () => {
                const piecePlacements = [
                    {
                        piece: testPieceFoo,
                        position: ['a', 1] as BoardPosition
                    },
                    { piece: testPieceBar, position: ['c', 3] as BoardPosition }
                ];
                const board = new RectangularBoard(
                    testBoardConfig,
                    piecePlacements
                );

                expect(board.getSpace(['a', 2]).piece).toBeUndefined();
                expect(board.getSpace(['a', 3]).piece).toBeUndefined();
                expect(board.getSpace(['b', 1]).piece).toBeUndefined();
                expect(board.getSpace(['b', 2]).piece).toBeUndefined();
                expect(board.getSpace(['b', 3]).piece).toBeUndefined();
                expect(board.getSpace(['c', 1]).piece).toBeUndefined();
                expect(board.getSpace(['c', 2]).piece).toBeUndefined();
            });

            test('Throws error if multiple pieces have same position', () => {
                const piecePlacements = [
                    {
                        piece: testPieceFoo,
                        position: ['a', 1] as BoardPosition
                    },
                    { piece: testPieceBar, position: ['a', 1] as BoardPosition }
                ];

                expect(
                    () => new RectangularBoard(testBoardConfig, piecePlacements)
                ).toThrow(PieceConfigurationError);
            });

            test.each([
                ['a', 5],
                ['g', 3],
                ['1', 2],
                ['b', 2.4],
                ['c', 0]
            ])(
                'Throws if piece is placed on invalid position %s%d',
                (file: string, rank: number) => {
                    const piecePlacements = [
                        {
                            piece: testPieceFoo,
                            position: [file, rank] as BoardPosition
                        }
                    ];

                    expect(
                        () =>
                            new RectangularBoard(
                                testBoardConfig,
                                piecePlacements
                            )
                    ).toThrow(InvalidSpaceError);
                }
            );
        });
    });

    describe('getSpace', () => {
        let board: RectangularBoard<testPieceNames>;

        beforeEach(() => {
            const piecePlacements = [
                { piece: testPieceFoo, position: ['a', 1] as BoardPosition },
                { piece: testPieceBar, position: ['c', 3] as BoardPosition }
            ];
            board = new RectangularBoard(testBoardConfig, piecePlacements);
        });

        describe('returns correct piece', () => {
            test.each([
                ['a', 1, 'foo', 'white'],
                ['c', 3, 'bar', 'black']
            ])(
                'For test configuration space %s%d returns piece %s',
                (
                    file: string,
                    rank: number,
                    expectedPieceName: string,
                    expectedPlayerColor: string
                ) => {
                    const space = board.getSpace([file, rank]);
                    expect(space.piece?.pieceName).toEqual(expectedPieceName);
                    expect(space.piece?.playerColor).toEqual(
                        expectedPlayerColor
                    );
                }
            );
        });

        describe('correctly returns empty space', () => {
            test.each([
                ['a', 2],
                ['a', 3],
                ['b', 1],
                ['b', 2],
                ['b', 3],
                ['c', 1],
                ['c', 2]
            ])(
                'For test configuration space %s%d returns empty space',
                (file: string, rank: number) => {
                    const space = board.getSpace([file, rank]);
                    expect(space.piece).toBeUndefined();
                }
            );
        });

        describe('Returns correct piece with indicies', () => {
            test.each([
                [0, 0, 'foo', 'white'],
                [2, 2, 'bar', 'black']
            ])(
                'For test configuration indicies %d%d returns piece %s',
                (
                    fileIndex: number,
                    rankIndex: number,
                    expectedPieceName: string,
                    expectedPlayerColor: string
                ) => {
                    const space = board.getSpace([fileIndex, rankIndex]);
                    expect(space.piece?.pieceName).toEqual(expectedPieceName);
                    expect(space.piece?.playerColor).toEqual(
                        expectedPlayerColor
                    );
                }
            );
        });

        describe('correctly returns empty space with indicies', () => {
            test.each([
                [0, 1],
                [0, 2],
                [1, 0],
                [1, 1],
                [1, 2],
                [2, 0],
                [2, 1]
            ])(
                'For test configuration indicies %d%d returns empty space',
                (fileIndex: number, rankIndex: number) => {
                    const space = board.getSpace([fileIndex, rankIndex]);
                    expect(space.piece).toBeUndefined();
                }
            );
        });

        describe('Invalid input throws error', () => {
            test.each([
                ['a', 4],
                ['a', 0],
                ['d', 1],
                ['111', 2],
                ['b', Infinity],
                ['', 2],
                ['c', 10],
                ['i', 10]
            ])(
                'Coordinates %s%d throws an error',
                (file: string, rank: number) => {
                    expect(() => {
                        board.getSpace([file, rank]);
                    }).toThrow(InvalidSpaceError);
                }
            );

            test.each([
                [1, 3],
                [-1, 0],
                [0, -1],
                [3, 3],
                [1.3, 1],
                [1, 1.3],
                [Infinity, 0],
                [0, Infinity]
            ])(
                'Indicies %d, %d throws an error',
                (fileIndex: number, rankIndex: number) => {
                    expect(() => {
                        board.getSpace([fileIndex, rankIndex]);
                    }).toThrow(InvalidSpaceError);
                }
            );
        });
    });

    describe('getPieceSpaces', () => {
        let board: RectangularBoard<testPieceNames>;

        beforeEach(() => {
            const piecePlacements = [
                { piece: testPieceFoo, position: ['a', 1] as BoardPosition },
                {
                    piece: testPieceWhiteBaz,
                    position: ['a', 3] as BoardPosition
                },
                { piece: testPieceBar, position: ['c', 1] as BoardPosition },
                {
                    piece: testPieceBlackBaz,
                    position: ['c', 3] as BoardPosition
                }
            ];
            board = new RectangularBoard(testBoardConfig, piecePlacements);
        });

        test('returns 4 pieces when no filters are applied', () => {
            const result = board.getPieceSpaces({});
            expect(result).toHaveLength(4);
        });

        test('returns only white pieces when isColor is set to white', () => {
            const result = board.getPieceSpaces({ isColor: 'white' });
            expect(result).toHaveLength(2);

            for (const space of result) {
                expect(space.piece?.playerColor).toEqual('white');
            }
        });

        test('returns only black pieces when isColor is set to black', () => {
            const result = board.getPieceSpaces({ isColor: 'black' });
            expect(result).toHaveLength(2);

            for (const space of result) {
                expect(space.piece?.playerColor).toEqual('black');
            }
        });

        test('returns only white pieces when notColor is set to black', () => {
            const result = board.getPieceSpaces({ notColor: 'black' });
            expect(result).toHaveLength(2);

            for (const space of result) {
                expect(space.piece?.playerColor).toEqual('white');
            }
        });

        test('returns only black pieces when notColor is set to white', () => {
            const result = board.getPieceSpaces({ notColor: 'white' });
            expect(result).toHaveLength(2);

            for (const space of result) {
                expect(space.piece?.playerColor).toEqual('black');
            }
        });

        test('returns only pieces of given name when name is set', () => {
            const result = board.getPieceSpaces({ name: 'baz' });
            expect(result).toHaveLength(2);

            for (const space of result) {
                expect(space.piece?.pieceName).toEqual('baz');
            }
        });

        test('returns only piece of given name and color when name and color are both set', () => {
            const result = board.getPieceSpaces({
                name: 'baz',
                isColor: 'black'
            });

            expect(result).toHaveLength(1);
            expect(result[0].piece?.pieceName).toEqual('baz');
            expect(result[0].piece?.playerColor).toEqual('black');
        });

        test('returns correct position', () => {
            const result = board.getPieceSpaces({
                name: 'baz',
                isColor: 'black'
            });

            expect(result).toHaveLength(1);
            expect(result[0].position).toEqual(['c', 3]);
        });

        test('returns empty array when no pieces satisfy conditions', () => {
            const result = board.getPieceSpaces({
                name: 'bar',
                isColor: 'white'
            });

            expect(result).toHaveLength(0);
        });

        test('returns empty array when board has no pieces', () => {
            const emptyBoard = new RectangularBoard(testBoardConfig, []);

            const result = emptyBoard.getPieceSpaces({});
            expect(result).toHaveLength(0);
        });
    });
});
