import {
    RectangularBoardConfig,
    RulesConfigurationError
} from '../../../../types';
import { GameStatePiecePlacement } from '../../../gameState';
import { generateGameState } from '../../../gameState/generateGameState';
import { generateOtherPieceHasNotMovedFunctionV2 } from './otherPieceHasNotMovedV2';

type testPieceNames = ['foo', 'bar'];
describe('generateOtherPieceHasNotMovedFunctionV2', () => {
    const boardConfig: RectangularBoardConfig = {
        height: 3,
        width: 3
    };

    test('returns true if piece is on target space and has not moved', () => {
        const piecePlacements: GameStatePiecePlacement<testPieceNames>[] = [
            {
                piece: { name: 'foo', color: 'white', moveCount: 0 },
                position: ['a', 1]
            },
            {
                piece: { name: 'bar', color: 'white', moveCount: 0 },
                position: ['a', 3]
            }
        ];

        const state = generateGameState(piecePlacements, 'white', boardConfig);
        const func = generateOtherPieceHasNotMovedFunctionV2<testPieceNames>(
            'bar',
            { white: ['a', 3], black: ['c', 3] }
        );
        const result = func(state, {
            piecePosition: ['a', 1],
            getLegalMovesFunctions: new Map()
        });

        expect(result).toEqual(true);
    });

    test('returns false if no piece is on target space', () => {
        const piecePlacements: GameStatePiecePlacement<testPieceNames>[] = [
            {
                piece: { name: 'foo', color: 'black', moveCount: 0 },
                position: ['c', 3]
            }
        ];

        const state = generateGameState(piecePlacements, 'black', boardConfig);
        const func = generateOtherPieceHasNotMovedFunctionV2<testPieceNames>(
            'bar',
            { white: ['a', 3], black: ['c', 3] }
        );
        const result = func(state, {
            piecePosition: ['c', 3],
            getLegalMovesFunctions: new Map()
        });

        expect(result).toEqual(false);
    });

    test('returns false if incorrect piece is on target space', () => {
        const piecePlacements: GameStatePiecePlacement<testPieceNames>[] = [
            {
                piece: { name: 'foo', color: 'white', moveCount: 0 },
                position: ['a', 1]
            },
            {
                piece: { name: 'foo', color: 'white', moveCount: 0 },
                position: ['a', 3]
            }
        ];

        const state = generateGameState(piecePlacements, 'white', boardConfig);
        const func = generateOtherPieceHasNotMovedFunctionV2<testPieceNames>(
            'bar',
            { white: ['a', 3], black: ['c', 3] }
        );
        const result = func(state, {
            piecePosition: ['a', 1],
            getLegalMovesFunctions: new Map()
        });

        expect(result).toEqual(false);
    });

    test('returns false if piece of incorrect color is on target space', () => {
        const piecePlacements: GameStatePiecePlacement<testPieceNames>[] = [
            {
                piece: { name: 'foo', color: 'white', moveCount: 0 },
                position: ['a', 1]
            },
            {
                piece: { name: 'bar', color: 'black', moveCount: 0 },
                position: ['a', 3]
            }
        ];

        const state = generateGameState(piecePlacements, 'white', boardConfig);
        const func = generateOtherPieceHasNotMovedFunctionV2<testPieceNames>(
            'bar',
            { white: ['a', 3], black: ['c', 3] }
        );
        const result = func(state, {
            piecePosition: ['a', 1],
            getLegalMovesFunctions: new Map()
        });

        expect(result).toEqual(false);
    });

    test('returns false if correct piece is on target space but it has previously moved', () => {
        const piecePlacements: GameStatePiecePlacement<testPieceNames>[] = [
            {
                piece: { name: 'foo', color: 'white', moveCount: 0 },
                position: ['c', 1]
            },
            {
                piece: { name: 'bar', color: 'white', moveCount: 1 },
                position: ['c', 3]
            }
        ];

        const state = generateGameState(piecePlacements, 'black', boardConfig);
        const func = generateOtherPieceHasNotMovedFunctionV2<testPieceNames>(
            'bar',
            { white: ['a', 3], black: ['c', 3] }
        );
        const result = func(state, {
            piecePosition: ['c', 1],
            getLegalMovesFunctions: new Map()
        });

        expect(result).toEqual(false);
    });

    test('Throws error if piece color is not in configuration', () => {
        const piecePlacements: GameStatePiecePlacement<testPieceNames>[] = [
            {
                piece: { name: 'foo', color: 'black', moveCount: 0 },
                position: ['c', 1]
            },
            {
                piece: { name: 'bar', color: 'black', moveCount: 0 },
                position: ['c', 3]
            }
        ];

        const state = generateGameState(piecePlacements, 'black', boardConfig);
        const func = generateOtherPieceHasNotMovedFunctionV2<testPieceNames>(
            'bar',
            { white: ['a', 3] }
        );

        expect(() => {
            func(state, {
                piecePosition: ['c', 1],
                getLegalMovesFunctions: new Map()
            });
        }).toThrow(RulesConfigurationError);
    });
});
