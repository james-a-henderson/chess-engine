import { standardChessConfig } from '../rulesConfiguration';
import { InvalidSpaceError } from '../types';
import { GameEngine } from './GameEngine';
import { styleText } from 'node:util';

describe('engine utilities', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    describe('getSpace', () => {
        const engine = new GameEngine(standardChessConfig);
        describe('Returns correct piece on standard starting position with coordinates', () => {
            test.each([
                ['a', 1, 'white', 'rook'],
                ['b', 1, 'white', 'knight'],
                ['c', 1, 'white', 'bishop'],
                ['d', 1, 'white', 'queen'],
                ['e', 1, 'white', 'king'],
                ['f', 1, 'white', 'bishop'],
                ['g', 1, 'white', 'knight'],
                ['h', 1, 'white', 'rook'],
                ['a', 2, 'white', 'pawn'],
                ['b', 2, 'white', 'pawn'],
                ['c', 2, 'white', 'pawn'],
                ['d', 2, 'white', 'pawn'],
                ['e', 2, 'white', 'pawn'],
                ['f', 2, 'white', 'pawn'],
                ['g', 2, 'white', 'pawn'],
                ['h', 2, 'white', 'pawn'],
                ['a', 8, 'black', 'rook'],
                ['b', 8, 'black', 'knight'],
                ['c', 8, 'black', 'bishop'],
                ['d', 8, 'black', 'queen'],
                ['e', 8, 'black', 'king'],
                ['f', 8, 'black', 'bishop'],
                ['g', 8, 'black', 'knight'],
                ['h', 8, 'black', 'rook'],
                ['a', 7, 'black', 'pawn'],
                ['b', 7, 'black', 'pawn'],
                ['c', 7, 'black', 'pawn'],
                ['d', 7, 'black', 'pawn'],
                ['e', 7, 'black', 'pawn'],
                ['f', 7, 'black', 'pawn'],
                ['g', 7, 'black', 'pawn'],
                ['h', 7, 'black', 'pawn']
            ])(
                'position: %s%d expected: %s %s',
                (
                    file: string,
                    rank: number,
                    playerColor: string,
                    pieceName: string
                ) => {
                    const space = engine.getSpace([file, rank]);
                    expect(space.piece?.playerColor).toEqual(playerColor);
                    expect(space.piece?.pieceName).toEqual(pieceName);
                }
            );

            test.each([
                ['a', 3],
                ['b', 3],
                ['c', 3],
                ['d', 3],
                ['e', 3],
                ['f', 3],
                ['g', 3],
                ['h', 3],
                ['a', 4],
                ['b', 4],
                ['c', 4],
                ['d', 4],
                ['e', 4],
                ['f', 4],
                ['g', 4],
                ['h', 4],
                ['a', 5],
                ['b', 5],
                ['c', 5],
                ['d', 5],
                ['e', 5],
                ['f', 5],
                ['g', 5],
                ['h', 5],
                ['a', 6],
                ['b', 6],
                ['c', 6],
                ['d', 6],
                ['e', 6],
                ['f', 6],
                ['g', 6],
                ['h', 6]
            ])(
                'position: %s%d does not contain piece',
                (file: string, rank: number) => {
                    const space = engine.getSpace([file, rank]);
                    expect(space.piece).toBeUndefined();
                }
            );
        });

        describe('Returns correct piece on standard starting position with indicies', () => {
            test.each([
                [0, 0, 'white', 'rook'],
                [1, 0, 'white', 'knight'],
                [2, 0, 'white', 'bishop'],
                [3, 0, 'white', 'queen'],
                [4, 0, 'white', 'king'],
                [5, 0, 'white', 'bishop'],
                [6, 0, 'white', 'knight'],
                [7, 0, 'white', 'rook'],
                [0, 1, 'white', 'pawn'],
                [1, 1, 'white', 'pawn'],
                [2, 1, 'white', 'pawn'],
                [3, 1, 'white', 'pawn'],
                [4, 1, 'white', 'pawn'],
                [5, 1, 'white', 'pawn'],
                [6, 1, 'white', 'pawn'],
                [7, 1, 'white', 'pawn'],
                [0, 7, 'black', 'rook'],
                [1, 7, 'black', 'knight'],
                [2, 7, 'black', 'bishop'],
                [3, 7, 'black', 'queen'],
                [4, 7, 'black', 'king'],
                [5, 7, 'black', 'bishop'],
                [6, 7, 'black', 'knight'],
                [7, 7, 'black', 'rook'],
                [0, 6, 'black', 'pawn'],
                [1, 6, 'black', 'pawn'],
                [2, 6, 'black', 'pawn'],
                [3, 6, 'black', 'pawn'],
                [4, 6, 'black', 'pawn'],
                [5, 6, 'black', 'pawn'],
                [6, 6, 'black', 'pawn'],
                [7, 6, 'black', 'pawn']
            ])(
                'indicies: %d, %d expected: %s %s',
                (
                    fileIndex: number,
                    rankIndex: number,
                    playerColor: string,
                    pieceName: string
                ) => {
                    const space = engine.getSpace([fileIndex, rankIndex]);
                    expect(space.piece?.playerColor).toEqual(playerColor);
                    expect(space.piece?.pieceName).toEqual(pieceName);
                }
            );

            test.each([
                [0, 2],
                [1, 2],
                [2, 2],
                [3, 2],
                [4, 2],
                [5, 2],
                [6, 2],
                [7, 2],
                [0, 3],
                [1, 3],
                [2, 3],
                [3, 3],
                [4, 3],
                [5, 3],
                [6, 3],
                [7, 3],
                [0, 4],
                [1, 4],
                [2, 4],
                [3, 4],
                [4, 4],
                [5, 4],
                [6, 4],
                [7, 4],
                [0, 5],
                [1, 5],
                [2, 5],
                [3, 5],
                [4, 5],
                [5, 5],
                [6, 5],
                [7, 5]
            ])(
                'position: %d, %d does not contain piece',
                (fileIndex: number, rankIndex: number) => {
                    const space = engine.getSpace([fileIndex, rankIndex]);
                    expect(space.piece).toBeUndefined();
                }
            );
        });

        describe('throws error on invalid space', () => {
            test.each([
                ['q', 2],
                ['a', 0],
                ['1111', 3],
                ['e', Infinity],
                ['', 7],
                ['a', 9],
                ['i', 1]
            ])('Coordinate %s%d throws error', (file: string, rank: number) => {
                expect(() => {
                    engine.getSpace([file, rank]);
                }).toThrow(InvalidSpaceError);
            });

            test.each([
                [0, 10],
                [-4, 3],
                [8, 8],
                [Infinity, 0],
                [0, Infinity]
            ])(
                'Indicies %d, %d throws erorr',
                (fileIndex: number, rankIndex: number) => {
                    expect(() => {
                        engine.getSpace([fileIndex, rankIndex]);
                    }).toThrow(InvalidSpaceError);
                }
            );
        });
    });

    describe('indiciesToCoordinates', () => {
        const engine = new GameEngine(standardChessConfig);

        test.each([
            [0, 0, 'a', 1],
            [7, 7, 'h', 8],
            [0, 7, 'a', 8],
            [7, 0, 'h', 1],
            [4, 5, 'e', 6]
        ])(
            'Indicies %d, %d expected: %s%d',
            (
                fileIndex: number,
                rankIndex: number,
                expectedFile: string,
                expectedRank: number
            ) => {
                const result = engine.indiciesToCoordinates([
                    fileIndex,
                    rankIndex
                ]);
                expect(result[0]).toEqual(expectedFile);
                expect(result[1]).toEqual(expectedRank);
            }
        );

        test.each([
            [1, 10],
            [-5, 5],
            [5, -5],
            [8, 8],
            [Infinity, 1],
            [0, Infinity]
        ])(
            'Indicies %d, %d throws error',
            (fileIndex: number, rankIndex: number) => {
                expect(() => {
                    engine.indiciesToCoordinates([fileIndex, rankIndex]);
                }).toThrow(InvalidSpaceError);
            }
        );
    });

    describe('coordinatestoIndicies', () => {
        const engine = new GameEngine(standardChessConfig);
        test.each([
            ['a', 1, 0, 0],
            ['a', 8, 0, 7],
            ['h', 1, 7, 0],
            ['h', 8, 7, 7],
            ['b', 4, 1, 3]
        ])(
            'Coordinates %s%d expected: %d, %d',
            (
                file: string,
                rank: number,
                expectedFileIndex: number,
                expectedRankIndex: number
            ) => {
                const result = engine.coordinatesToIndicies([file, rank]);
                expect(result[0]).toEqual(expectedFileIndex);
                expect(result[1]).toEqual(expectedRankIndex);
            }
        );

        test.each([
            ['', 1],
            ['a', 0],
            ['i', 5],
            ['c', -3],
            ['aa', 6],
            ['f', Infinity]
        ])('Coordinates %s%d throws error', (file: string, rank: number) => {
            expect(() => {
                engine.coordinatesToIndicies([file, rank]);
            }).toThrow(InvalidSpaceError);
        });
    });

    describe('printBoard', () => {
        const darkSquare: ('bgGray' | 'black')[] = ['bgGray', 'black'];
        const lightSquare: ('bgWhite' | 'black')[] = ['bgWhite', 'black'];
        const outputs = {
            empty: {
                dark: styleText('bgGray', '   '),
                light: styleText('bgWhite', '   ')
            },
            white: {
                pawn: {
                    dark: styleText(darkSquare, ' ♙ '),
                    light: styleText(lightSquare, ' ♙ ')
                },
                rook: {
                    dark: styleText(darkSquare, ' ♖ '),
                    light: styleText(lightSquare, ' ♖ ')
                },
                knight: {
                    dark: styleText(darkSquare, ' ♘ '),
                    light: styleText(lightSquare, ' ♘ ')
                },
                bishop: {
                    dark: styleText(darkSquare, ' ♗ '),
                    light: styleText(lightSquare, ' ♗ ')
                },
                queen: {
                    dark: styleText(darkSquare, ' ♕ '),
                    light: styleText(lightSquare, ' ♕ ')
                },
                king: {
                    dark: styleText(darkSquare, ' ♔ '),
                    light: styleText(lightSquare, ' ♔ ')
                }
            },
            black: {
                pawn: {
                    dark: styleText(darkSquare, ' ♟ '),
                    light: styleText(lightSquare, ' ♟ ')
                },
                rook: {
                    dark: styleText(darkSquare, ' ♜ '),
                    light: styleText(lightSquare, ' ♜ ')
                },
                knight: {
                    dark: styleText(darkSquare, ' ♞ '),
                    light: styleText(lightSquare, ' ♞ ')
                },
                bishop: {
                    dark: styleText(darkSquare, ' ♝ '),
                    light: styleText(lightSquare, ' ♝ ')
                },
                queen: {
                    dark: styleText(darkSquare, ' ♛ '),
                    light: styleText(lightSquare, ' ♛ ')
                },
                king: {
                    dark: styleText(darkSquare, ' ♚ '),
                    light: styleText(lightSquare, ' ♚ ')
                }
            }
        };

        test('outputs correct board with standard chess configuration', () => {
            const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
            const engine = new GameEngine(standardChessConfig);
            engine.printBoard();

            expect(spy).toHaveBeenCalledWith(
                outputs.black.rook.light +
                    outputs.black.knight.dark +
                    outputs.black.bishop.light +
                    outputs.black.queen.dark +
                    outputs.black.king.light +
                    outputs.black.bishop.dark +
                    outputs.black.knight.light +
                    outputs.black.rook.dark +
                    '\n' +
                    outputs.black.pawn.dark +
                    outputs.black.pawn.light +
                    outputs.black.pawn.dark +
                    outputs.black.pawn.light +
                    outputs.black.pawn.dark +
                    outputs.black.pawn.light +
                    outputs.black.pawn.dark +
                    outputs.black.pawn.light +
                    '\n' +
                    outputs.empty.light +
                    outputs.empty.dark +
                    outputs.empty.light +
                    outputs.empty.dark +
                    outputs.empty.light +
                    outputs.empty.dark +
                    outputs.empty.light +
                    outputs.empty.dark +
                    '\n' +
                    outputs.empty.dark +
                    outputs.empty.light +
                    outputs.empty.dark +
                    outputs.empty.light +
                    outputs.empty.dark +
                    outputs.empty.light +
                    outputs.empty.dark +
                    outputs.empty.light +
                    '\n' +
                    outputs.empty.light +
                    outputs.empty.dark +
                    outputs.empty.light +
                    outputs.empty.dark +
                    outputs.empty.light +
                    outputs.empty.dark +
                    outputs.empty.light +
                    outputs.empty.dark +
                    '\n' +
                    outputs.empty.dark +
                    outputs.empty.light +
                    outputs.empty.dark +
                    outputs.empty.light +
                    outputs.empty.dark +
                    outputs.empty.light +
                    outputs.empty.dark +
                    outputs.empty.light +
                    '\n' +
                    outputs.white.pawn.light +
                    outputs.white.pawn.dark +
                    outputs.white.pawn.light +
                    outputs.white.pawn.dark +
                    outputs.white.pawn.light +
                    outputs.white.pawn.dark +
                    outputs.white.pawn.light +
                    outputs.white.pawn.dark +
                    '\n' +
                    outputs.white.rook.dark +
                    outputs.white.knight.light +
                    outputs.white.bishop.dark +
                    outputs.white.queen.light +
                    outputs.white.king.dark +
                    outputs.white.bishop.light +
                    outputs.white.knight.dark +
                    outputs.white.rook.light +
                    '\n'
            );
        });
    });
});
