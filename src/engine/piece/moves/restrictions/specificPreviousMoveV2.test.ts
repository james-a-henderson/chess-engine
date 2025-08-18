import { MoveRecord, RectangularBoardConfig } from '../../../../types';
import { GameStatePiecePlacement } from '../../../gameState';
import { generateGameState } from '../../../gameState/generateGameState';
import { generateSpecificPreviousMoveFunctionV2 } from './specificPreviousMoveV2';

type testPieceNames = ['foo', 'bar'];
describe('generateSpecificPreviousMoveFunctionV2', () => {
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
        const piecePlacements: GameStatePiecePlacement<testPieceNames>[] = [
            {
                piece: { name: 'foo', color: 'white', moveCount: 0 },
                position: ['a', 1]
            },
            {
                piece: { name: 'bar', color: 'black', moveCount: 1 },
                position: ['c', 1]
            }
        ];

        const state = generateGameState(piecePlacements, 'white', boardConfig);

        const func = generateSpecificPreviousMoveFunctionV2<testPieceNames>(
            'test',
            []
        );

        const result = func(state, {
            piecePosition: ['a', 1],
            previousMove: {
                ...moveRecord,
                moveName: 'notTest'
            },
            getLegalMovesFunctions: new Map()
        });

        expect(result).toEqual(false);
    });

    test('Generated function returns true if previous move is correct and positions are not configured', () => {
        const piecePlacements: GameStatePiecePlacement<testPieceNames>[] = [
            {
                piece: { name: 'foo', color: 'white', moveCount: 0 },
                position: ['a', 1]
            },
            {
                piece: { name: 'bar', color: 'black', moveCount: 1 },
                position: ['c', 1]
            }
        ];

        const state = generateGameState(piecePlacements, 'white', boardConfig);

        const func = generateSpecificPreviousMoveFunctionV2<testPieceNames>(
            'test',
            []
        );

        const result = func(state, {
            piecePosition: ['a', 1],
            previousMove: moveRecord,
            getLegalMovesFunctions: new Map()
        });

        expect(result).toEqual(true);
    });

    test('Generated function returns false if previously moved piece is in an invalid direction', () => {
        const piecePlacements: GameStatePiecePlacement<testPieceNames>[] = [
            {
                piece: { name: 'foo', color: 'white', moveCount: 0 },
                position: ['a', 1]
            },
            {
                piece: { name: 'bar', color: 'black', moveCount: 1 },
                position: ['b', 3]
            }
        ];

        const state = generateGameState(piecePlacements, 'white', boardConfig);

        const func = generateSpecificPreviousMoveFunctionV2<testPieceNames>(
            'test',
            [{ direction: 'right', numSpaces: 2 }]
        );

        const result = func(state, {
            piecePosition: ['a', 1],
            previousMove: {
                ...moveRecord,
                destinationSpace: ['b', 3]
            },
            getLegalMovesFunctions: new Map()
        });

        expect(result).toEqual(false);
    });

    test('Generated function returns true if previously moved piece in configured location', () => {
        const piecePlacements: GameStatePiecePlacement<testPieceNames>[] = [
            {
                piece: { name: 'foo', color: 'white', moveCount: 0 },
                position: ['a', 1]
            },
            {
                piece: { name: 'bar', color: 'black', moveCount: 1 },
                position: ['c', 1]
            }
        ];

        const state = generateGameState(piecePlacements, 'white', boardConfig);

        const func = generateSpecificPreviousMoveFunctionV2<testPieceNames>(
            'test',
            [{ direction: 'right', numSpaces: 2 }]
        );

        const result = func(state, {
            piecePosition: ['a', 1],
            previousMove: moveRecord,
            getLegalMovesFunctions: new Map()
        });

        expect(result).toEqual(true);
    });

    test('Generated function returns false if previously moved piece is not in configured location', () => {
        const piecePlacements: GameStatePiecePlacement<testPieceNames>[] = [
            {
                piece: { name: 'foo', color: 'white', moveCount: 0 },
                position: ['a', 1]
            },
            {
                piece: { name: 'bar', color: 'black', moveCount: 1 },
                position: ['c', 1]
            }
        ];

        const state = generateGameState(piecePlacements, 'white', boardConfig);

        const func = generateSpecificPreviousMoveFunctionV2<testPieceNames>(
            'test',
            [{ direction: 'right', numSpaces: 1 }]
        );

        const result = func(state, {
            piecePosition: ['a', 1],
            previousMove: moveRecord,
            getLegalMovesFunctions: new Map()
        });

        expect(result).toEqual(false);
    });

    test('Generated function returns true if previously moved piece is in one of many configured locations', () => {
        const piecePlacements: GameStatePiecePlacement<testPieceNames>[] = [
            {
                piece: { name: 'foo', color: 'white', moveCount: 0 },
                position: ['a', 1]
            },
            {
                piece: { name: 'bar', color: 'black', moveCount: 1 },
                position: ['c', 1]
            }
        ];

        const state = generateGameState(piecePlacements, 'white', boardConfig);

        const func = generateSpecificPreviousMoveFunctionV2<testPieceNames>(
            'test',
            [
                { direction: 'right', numSpaces: 1 },
                { direction: 'forward', numSpaces: 2 },
                { direction: 'right', numSpaces: 2 }
            ]
        );

        const result = func(state, {
            piecePosition: ['a', 1],
            previousMove: moveRecord,
            getLegalMovesFunctions: new Map()
        });

        expect(result).toEqual(true);
    });

    test('Generated function correctly flips direction for black piece', () => {
        const piecePlacements: GameStatePiecePlacement<testPieceNames>[] = [
            {
                piece: { name: 'foo', color: 'black', moveCount: 0 },
                position: ['c', 1]
            },
            {
                piece: { name: 'bar', color: 'white', moveCount: 1 },
                position: ['a', 1]
            }
        ];

        const state = generateGameState(piecePlacements, 'black', boardConfig);

        const func = generateSpecificPreviousMoveFunctionV2<testPieceNames>(
            'test',
            [{ direction: 'right', numSpaces: 2 }]
        );

        const result = func(state, {
            piecePosition: ['c', 1],
            getLegalMovesFunctions: new Map(),
            previousMove: {
                ...moveRecord,
                destinationSpace: ['a', 1],
                pieceColor: 'white'
            }
        });

        expect(result).toEqual(true);
    });
});
