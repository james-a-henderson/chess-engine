import {
    InvalidSpaceError,
    PieceConfigurationError,
    RectangularBoardConfig
} from '../../types';
import { PiecePlacement } from '../../types/engine/gameState';
import { generateGameState } from './generateGameState';

type pieceNames = ['foo', 'bar'];

describe('generateGameState', () => {
    const testBoardConfig: RectangularBoardConfig = { width: 2, height: 2 };

    test('Result board is of correct size', () => {
        const result = generateGameState<pieceNames>(
            [],
            'white',
            testBoardConfig
        );

        expect(result.board).toHaveLength(2);
        expect(result.board[0]).toHaveLength(2);
        expect(result.board[1]).toHaveLength(2);
    });

    test('board coordinates are correct', () => {
        const result = generateGameState<pieceNames>(
            [],
            'white',
            testBoardConfig
        );

        expect(result.board[0][0].position).toEqual(['a', 1]);
        expect(result.board[0][1].position).toEqual(['a', 2]);
        expect(result.board[1][0].position).toEqual(['b', 1]);
        expect(result.board[1][1].position).toEqual(['b', 2]);
    });

    test('currentPlayer is correct with white input', () => {
        const result = generateGameState<pieceNames>(
            [],
            'white',
            testBoardConfig
        );

        expect(result.currentPlayer).toEqual('white');
    });

    test('currentPlayer is correct with black input', () => {
        const result = generateGameState<pieceNames>(
            [],
            'black',
            testBoardConfig
        );

        expect(result.currentPlayer).toEqual('black');
    });

    test('No piece placements generates empty board', () => {
        const result = generateGameState<pieceNames>(
            [],
            'white',
            testBoardConfig
        );

        expect(result.board[0][0].piece).toBeUndefined();
        expect(result.board[0][1].piece).toBeUndefined();
        expect(result.board[1][0].piece).toBeUndefined();
        expect(result.board[1][1].piece).toBeUndefined();
    });

    test('Piece placements are on expected positions', () => {
        const piecePlacements: PiecePlacement<pieceNames>[] = [
            {
                piece: {
                    color: 'white',
                    moveCount: 0,
                    name: 'foo'
                },
                position: ['a', 1]
            },
            {
                piece: {
                    color: 'black',
                    moveCount: 0,
                    name: 'bar'
                },
                position: ['b', 2]
            }
        ];

        const result = generateGameState(
            piecePlacements,
            'white',
            testBoardConfig
        );

        expect(result.board[0][0].piece).toEqual({
            color: 'white',
            moveCount: 0,
            name: 'foo'
        });

        expect(result.board[1][1].piece).toEqual({
            color: 'black',
            moveCount: 0,
            name: 'bar'
        });
    });

    test('Pieces are not on spaces not specified', () => {
        const piecePlacements: PiecePlacement<pieceNames>[] = [
            {
                piece: {
                    color: 'white',
                    moveCount: 0,
                    name: 'foo'
                },
                position: ['a', 1]
            },
            {
                piece: {
                    color: 'black',
                    moveCount: 0,
                    name: 'bar'
                },
                position: ['b', 2]
            }
        ];

        const result = generateGameState(
            piecePlacements,
            'white',
            testBoardConfig
        );

        expect(result.board[0][1].piece).toBeUndefined();
        expect(result.board[1][0].piece).toBeUndefined();
    });

    test('Throws error if multiple pieces have same position', () => {
        const piecePlacements: PiecePlacement<pieceNames>[] = [
            {
                piece: {
                    color: 'white',
                    moveCount: 0,
                    name: 'foo'
                },
                position: ['a', 1]
            },
            {
                piece: {
                    color: 'black',
                    moveCount: 0,
                    name: 'bar'
                },
                position: ['a', 1]
            }
        ];

        expect(() =>
            generateGameState(piecePlacements, 'black', testBoardConfig)
        ).toThrow(PieceConfigurationError);
    });

    test.each([
        ['a', 3],
        ['c', 1],
        ['1', 2],
        ['b', 2.4],
        ['c', 0]
    ])(
        'Throws if piece is placed on invalid position %s%d',
        (file: string, rank: number) => {
            const piecePlacements: PiecePlacement<pieceNames>[] = [
                {
                    piece: {
                        color: 'white',
                        moveCount: 0,
                        name: 'foo'
                    },
                    position: [file, rank]
                }
            ];

            expect(() =>
                generateGameState(piecePlacements, 'white', testBoardConfig)
            ).toThrow(InvalidSpaceError);
        }
    );
});
