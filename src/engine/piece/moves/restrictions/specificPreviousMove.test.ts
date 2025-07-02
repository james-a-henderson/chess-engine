import {
    MoveRecord,
    PieceConfig,
    PiecePlacement,
    RectangularBoardConfig
} from '../../../../types';
import { RectangularBoard } from '../../../board';
import { Piece } from '../../piece';
import { generateSpecificPreviousMoveFunction } from './specificPreviousMove';

type testPieceNames = ['foo', 'bar'];
describe('generateSpecificPreviousMoveFunction', () => {
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

    const moveRecord: MoveRecord<testPieceNames> = {
        type: 'standard',
        destinationSpace: ['c', 1],
        moveName: 'test',
        originSpace: ['c', 3],
        pieceColor: 'black',
        pieceName: 'bar'
    };
    test('Generated function returns false if previous move has different name then configured', () => {
        const fooPiece = new Piece(pieceConfigFoo, 'white');
        const barPiece = new Piece(pieceConfigBar, 'black');

        const piecePlacements: PiecePlacement<testPieceNames>[] = [
            {
                piece: fooPiece,
                position: ['a', 1]
            },
            {
                piece: barPiece,
                position: ['c', 1]
            }
        ];

        const board = new RectangularBoard(boardConfig, piecePlacements);
        const func = generateSpecificPreviousMoveFunction<testPieceNames>(
            'test',
            []
        );

        const result = func(fooPiece, board, ['a', 1], {
            ...moveRecord,
            moveName: 'notTest'
        });

        expect(result).toEqual(false);
    });

    test('Generated function returns true if previous move is correct and positions are not configured', () => {
        const fooPiece = new Piece(pieceConfigFoo, 'white');
        const barPiece = new Piece(pieceConfigBar, 'black');

        const piecePlacements: PiecePlacement<testPieceNames>[] = [
            {
                piece: fooPiece,
                position: ['a', 1]
            },
            {
                piece: barPiece,
                position: ['c', 1]
            }
        ];

        const board = new RectangularBoard(boardConfig, piecePlacements);
        const func = generateSpecificPreviousMoveFunction<testPieceNames>(
            'test',
            []
        );

        const result = func(fooPiece, board, ['a', 1], moveRecord);

        expect(result).toEqual(true);
    });

    test('Generated function returns false if previously moved piece is in an invalid direction', () => {
        const fooPiece = new Piece(pieceConfigFoo, 'white');
        const barPiece = new Piece(pieceConfigBar, 'black');

        const piecePlacements: PiecePlacement<testPieceNames>[] = [
            {
                piece: fooPiece,
                position: ['a', 1]
            },
            {
                piece: barPiece,
                position: ['b', 3]
            }
        ];

        const board = new RectangularBoard(boardConfig, piecePlacements);
        const func = generateSpecificPreviousMoveFunction<testPieceNames>(
            'test',
            [{ direction: 'right', numSpaces: 2 }]
        );

        const result = func(fooPiece, board, ['a', 1], {
            ...moveRecord,
            destinationSpace: ['b', 3]
        });

        expect(result).toEqual(false);
    });

    test('Generated function returns true if previously moved piece in configured location', () => {
        const fooPiece = new Piece(pieceConfigFoo, 'white');
        const barPiece = new Piece(pieceConfigBar, 'black');

        const piecePlacements: PiecePlacement<testPieceNames>[] = [
            {
                piece: fooPiece,
                position: ['a', 1]
            },
            {
                piece: barPiece,
                position: ['c', 1]
            }
        ];

        const board = new RectangularBoard(boardConfig, piecePlacements);
        const func = generateSpecificPreviousMoveFunction<testPieceNames>(
            'test',
            [{ direction: 'right', numSpaces: 2 }]
        );

        const result = func(fooPiece, board, ['a', 1], moveRecord);

        expect(result).toEqual(true);
    });

    test('Generated function returns false if previously moved piece is not in configured location', () => {
        const fooPiece = new Piece(pieceConfigFoo, 'white');
        const barPiece = new Piece(pieceConfigBar, 'black');

        const piecePlacements: PiecePlacement<testPieceNames>[] = [
            {
                piece: fooPiece,
                position: ['a', 1]
            },
            {
                piece: barPiece,
                position: ['c', 1]
            }
        ];

        const board = new RectangularBoard(boardConfig, piecePlacements);
        const func = generateSpecificPreviousMoveFunction<testPieceNames>(
            'test',
            [{ direction: 'right', numSpaces: 1 }]
        );

        const result = func(fooPiece, board, ['a', 1], moveRecord);

        expect(result).toEqual(false);
    });

    test('Generated function returns true if previously moved piece is in one of many configured locations', () => {
        const fooPiece = new Piece(pieceConfigFoo, 'white');
        const barPiece = new Piece(pieceConfigBar, 'black');

        const piecePlacements: PiecePlacement<testPieceNames>[] = [
            {
                piece: fooPiece,
                position: ['a', 1]
            },
            {
                piece: barPiece,
                position: ['c', 1]
            }
        ];

        const board = new RectangularBoard(boardConfig, piecePlacements);
        const func = generateSpecificPreviousMoveFunction<testPieceNames>(
            'test',
            [
                { direction: 'right', numSpaces: 1 },
                { direction: 'forward', numSpaces: 2 },
                { direction: 'right', numSpaces: 2 }
            ]
        );

        const result = func(fooPiece, board, ['a', 1], moveRecord);

        expect(result).toEqual(true);
    });

    test('Generated function correctly flips direction for black piece', () => {
        const fooPiece = new Piece(pieceConfigFoo, 'black');
        const barPiece = new Piece(pieceConfigBar, 'white');

        const piecePlacements: PiecePlacement<testPieceNames>[] = [
            {
                piece: fooPiece,
                position: ['c', 1]
            },
            {
                piece: barPiece,
                position: ['a', 1]
            }
        ];

        const board = new RectangularBoard(boardConfig, piecePlacements);
        const func = generateSpecificPreviousMoveFunction<testPieceNames>(
            'test',
            [{ direction: 'right', numSpaces: 2 }]
        );

        const result = func(fooPiece, board, ['c', 1], {
            ...moveRecord,
            destinationSpace: ['a', 1],
            pieceColor: 'white'
        });

        expect(result).toEqual(true);
    });
});
