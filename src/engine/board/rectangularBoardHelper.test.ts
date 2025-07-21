import { InvalidSpaceError, RectangularBoardConfig } from '../../types';
import { GameState, GameStatePiecePlacement } from '../gameState';
import { generateGameState } from '../gameState/generateGameState';
import { rectangularBoardHelper } from './rectangularBoardHelper';

type testPieceNames = ['foo', 'bar'];
describe('rectangularBoardHelper', () => {
    const testBoardConfig: RectangularBoardConfig = {
        width: 3,
        height: 3
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
                testBoardConfig
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
});
