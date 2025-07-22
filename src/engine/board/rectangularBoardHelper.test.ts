import {
    BoardPosition,
    Direction,
    InvalidSpaceError,
    RectangularBoardConfig
} from '../../types';
import { GameState, GameStatePiecePlacement } from '../gameState';
import { generateGameState } from '../gameState/generateGameState';
import { rectangularBoardHelper } from './rectangularBoardHelper';

type testPieceNames = ['foo', 'bar'];
describe('rectangularBoardHelper', () => {
    const smallBoardConfig: RectangularBoardConfig = {
        width: 3,
        height: 3
    };

    const fullSizeBoardConfig: RectangularBoardConfig = {
        height: 8,
        width: 8
    };
    describe('getSpace', () => {
        let gameState: GameState<testPieceNames>;

        beforeEach(() => {
            const piecePlacements: GameStatePiecePlacement<testPieceNames>[] = [
                {
                    piece: { color: 'white', moveCount: 0, name: 'foo' },
                    position: ['a', 1]
                },
                {
                    piece: { color: 'black', moveCount: 1, name: 'bar' },
                    position: ['c', 3]
                }
            ];

            gameState = generateGameState(
                piecePlacements,
                'white',
                smallBoardConfig
            );
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
                    const space = rectangularBoardHelper.getSpace(gameState, [
                        file,
                        rank
                    ]);
                    expect(space.piece?.name).toEqual(expectedPieceName);
                    expect(space.piece?.color).toEqual(expectedPlayerColor);
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
                    const space = rectangularBoardHelper.getSpace(gameState, [
                        file,
                        rank
                    ]);
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
                    const space = rectangularBoardHelper.getSpace(gameState, [
                        fileIndex,
                        rankIndex
                    ]);
                    expect(space.piece?.name).toEqual(expectedPieceName);
                    expect(space.piece?.color).toEqual(expectedPlayerColor);
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
                    const space = rectangularBoardHelper.getSpace(gameState, [
                        fileIndex,
                        rankIndex
                    ]);
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
                        rectangularBoardHelper.getSpace(gameState, [
                            file,
                            rank
                        ]);
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
                        rectangularBoardHelper.getSpace(gameState, [
                            fileIndex,
                            rankIndex
                        ]);
                    }).toThrow(InvalidSpaceError);
                }
            );
        });
    });

    describe('getSpaceRelativePosition', () => {
        describe.each([
            ['forward', ['d', 5], ['d', 7]],
            ['backward', ['d', 3], ['d', 1]],
            ['left', ['c', 4], ['a', 4]],
            ['right', ['e', 4], ['g', 4]],
            ['leftForward', ['c', 5], ['a', 7]],
            ['rightForward', ['e', 5], ['g', 7]],
            ['leftBackward', ['c', 3], ['a', 1]],
            ['rightBackward', ['e', 3], ['g', 1]]
        ])(
            'Direction: %s',
            (
                direction: string,
                oneSpacePosition: (string | number)[],
                threeSpacesPosition: (string | number)[]
            ) => {
                const startingPosition: BoardPosition = ['d', 4];
                const state = generateGameState(
                    [],
                    'white',
                    fullSizeBoardConfig
                );
                test(`numSpaces of 1 has position of ${oneSpacePosition[0]}${oneSpacePosition[1]}`, () => {
                    const space =
                        rectangularBoardHelper.getSpaceRelativePosition(
                            state,
                            startingPosition,
                            direction as Direction,
                            1
                        );
                    expect(space.position[0]).toEqual(oneSpacePosition[0]);
                    expect(space.position[1]).toEqual(oneSpacePosition[1]);
                });

                test(`numSpaces of 3 has position of ${threeSpacesPosition[0]}${threeSpacesPosition[1]}`, () => {
                    const space =
                        rectangularBoardHelper.getSpaceRelativePosition(
                            state,
                            startingPosition,
                            direction as Direction,
                            3
                        );
                    expect(space.position[0]).toEqual(threeSpacesPosition[0]);
                    expect(space.position[1]).toEqual(threeSpacesPosition[1]);
                });

                test('numSpaces of 6 throws InvalidSpaceError', () => {
                    expect(() =>
                        rectangularBoardHelper.getSpaceRelativePosition(
                            state,
                            startingPosition,
                            direction as Direction,
                            6
                        )
                    ).toThrow(InvalidSpaceError);
                });
            }
        );
    });

    describe('indiciesToCoordinates', () => {
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
                const result = rectangularBoardHelper.indiciesToCoordinates(
                    fullSizeBoardConfig,
                    [fileIndex, rankIndex]
                );
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
                    rectangularBoardHelper.indiciesToCoordinates(
                        fullSizeBoardConfig,
                        [fileIndex, rankIndex]
                    );
                }).toThrow(InvalidSpaceError);
            }
        );
    });

    describe('coordinatestoIndicies', () => {
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
                const result = rectangularBoardHelper.coordinatesToIndicies(
                    fullSizeBoardConfig,
                    [file, rank]
                );
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
                rectangularBoardHelper.coordinatesToIndicies(
                    fullSizeBoardConfig,
                    [file, rank]
                );
            }).toThrow(InvalidSpaceError);
        });
    });
});
