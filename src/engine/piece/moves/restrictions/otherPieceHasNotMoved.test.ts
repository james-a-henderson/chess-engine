import {
    PieceConfig,
    PiecePlacement,
    RectangularBoardConfig,
    RulesConfigurationError
} from '../../../../types';
import { RectangularBoard } from '../../../board';
import { Piece } from '../../piece';
import { generateOtherPieceHasNotMovedFunction } from './otherPieceHasNotMoved';

type testPieceNames = ['foo', 'bar'];

describe('generateOtherPieceHasNotMovedFunction', () => {
    const pieceConfigFoo: PieceConfig<testPieceNames> = {
        name: 'foo',
        notation: 'F',
        displayCharacters: {
            white: 'F',
            black: 'f'
        },
        moves: [],
        startingPositions: {}
    };

    const pieceConfigBar: PieceConfig<testPieceNames> = {
        name: 'bar',
        notation: 'B',
        displayCharacters: {
            white: 'B',
            black: 'b'
        },
        moves: [],
        startingPositions: {}
    };

    const boardConfig: RectangularBoardConfig = {
        height: 3,
        width: 3
    };

    test('returns true if piece is on target space and has not moved', () => {
        const fooPiece = new Piece(pieceConfigFoo, 'white', boardConfig);
        const barPiece = new Piece(pieceConfigBar, 'white', boardConfig);

        const piecePlacements: PiecePlacement<testPieceNames>[] = [
            {
                piece: fooPiece,
                position: ['a', 1]
            },
            {
                piece: barPiece,
                position: ['a', 3]
            }
        ];

        const board = new RectangularBoard(boardConfig, piecePlacements);
        const func = generateOtherPieceHasNotMovedFunction<testPieceNames>(
            'bar',
            { white: ['a', 3], black: ['c', 3] }
        );
        const result = func(fooPiece, board, ['a', 1]);

        expect(result).toEqual(true);
    });

    test('returns false if no piece is on target space', () => {
        const fooPiece = new Piece(pieceConfigFoo, 'black', boardConfig);

        const piecePlacements: PiecePlacement<testPieceNames>[] = [
            {
                piece: fooPiece,
                position: ['c', 1]
            }
        ];

        const board = new RectangularBoard(boardConfig, piecePlacements);
        const func = generateOtherPieceHasNotMovedFunction<testPieceNames>(
            'bar',
            { white: ['a', 3], black: ['c', 3] }
        );
        const result = func(fooPiece, board, ['c', 1]);

        expect(result).toEqual(false);
    });

    test('returns false if incorrect piece is on target space', () => {
        const fooPiece1 = new Piece(pieceConfigFoo, 'white', boardConfig);
        const fooPiece2 = new Piece(pieceConfigFoo, 'white', boardConfig);

        const piecePlacements: PiecePlacement<testPieceNames>[] = [
            {
                piece: fooPiece1,
                position: ['a', 1]
            },
            {
                piece: fooPiece2,
                position: ['a', 3]
            }
        ];

        const board = new RectangularBoard(boardConfig, piecePlacements);
        const func = generateOtherPieceHasNotMovedFunction<testPieceNames>(
            'bar',
            { white: ['a', 3], black: ['c', 3] }
        );
        const result = func(fooPiece1, board, ['a', 1]);

        expect(result).toEqual(false);
    });

    test('returns false if piece of incorrect color is on target space', () => {
        const fooPiece = new Piece(pieceConfigFoo, 'white', boardConfig);
        const barPiece = new Piece(pieceConfigFoo, 'black', boardConfig);

        const piecePlacements: PiecePlacement<testPieceNames>[] = [
            {
                piece: fooPiece,
                position: ['a', 1]
            },
            {
                piece: barPiece,
                position: ['a', 3]
            }
        ];

        const board = new RectangularBoard(boardConfig, piecePlacements);
        const func = generateOtherPieceHasNotMovedFunction<testPieceNames>(
            'bar',
            { white: ['a', 3], black: ['c', 3] }
        );
        const result = func(fooPiece, board, ['a', 1]);

        expect(result).toEqual(false);
    });

    test('returns false if correct piece is on target space but it has previously moved', () => {
        const fooPiece = new Piece(pieceConfigFoo, 'black', boardConfig);
        const barPiece = new Piece(pieceConfigFoo, 'black', boardConfig);

        const piecePlacements: PiecePlacement<testPieceNames>[] = [
            {
                piece: fooPiece,
                position: ['c', 1]
            },
            {
                piece: barPiece,
                position: ['c', 3]
            }
        ];

        const board = new RectangularBoard(boardConfig, piecePlacements);
        barPiece.increaseMoveCount();
        const func = generateOtherPieceHasNotMovedFunction<testPieceNames>(
            'bar',
            { white: ['a', 3], black: ['c', 3] }
        );
        const result = func(fooPiece, board, ['c', 1]);

        expect(result).toEqual(false);
    });

    test('Throws error if piece color is not in configuration', () => {
        const fooPiece = new Piece(pieceConfigFoo, 'black', boardConfig);
        const barPiece = new Piece(pieceConfigFoo, 'black', boardConfig);

        const piecePlacements: PiecePlacement<testPieceNames>[] = [
            {
                piece: fooPiece,
                position: ['a', 1]
            },
            {
                piece: barPiece,
                position: ['a', 3]
            }
        ];

        const board = new RectangularBoard(boardConfig, piecePlacements);
        const func = generateOtherPieceHasNotMovedFunction<testPieceNames>(
            'bar',
            { white: ['a', 3] }
        );

        expect(() => {
            func(fooPiece, board, ['a', 1]);
        }).toThrow(RulesConfigurationError);
    });
});
