import { GameEngine } from '../engine';
import { testConfig } from '../rulesConfiguration';
import { assertBoardPosition } from '../testHelpers';
import { BoardPosition, GameRules, IllegalMoveError } from '../types';

type gameMove = [BoardPosition, BoardPosition]; //starting square, destination square

describe('integration tests', () => {
    //the goal with this test suite is to simulate chess games, and verify that the final board state is what we expect

    test.each([
        {
            rulesConfig: testConfig,
            moves: [
                [
                    ['a', 1],
                    ['a', 8]
                ],
                [
                    ['h', 8],
                    ['h', 5]
                ],
                [
                    ['h', 1],
                    ['h', 5]
                ]
            ] as gameMove[],
            expectedBoard: [
                ['♖', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
                [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
                [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
                [' ', ' ', ' ', ' ', ' ', ' ', ' ', '♖'],
                [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
                [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
                [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
                [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ']
            ]
        }
    ])(
        'General test %#',
        <PieceNames extends string[]>({
            rulesConfig,
            moves,
            expectedBoard
        }: {
            rulesConfig: GameRules<PieceNames>;
            moves: gameMove[];
            expectedBoard: (string | undefined)[][];
        }) => {
            runGeneralTest(rulesConfig, moves, expectedBoard);
        }
    );

    test.each([
        {
            rulesConfig: testConfig,
            moves: [
                [
                    ['a', 1],
                    ['a', 8]
                ],
                [
                    ['a', 8],
                    ['a', 5]
                ]
            ] as gameMove[]
        }
    ])(
        'Error test %#',
        <PieceNames extends string[]>({
            rulesConfig,
            moves
        }: {
            rulesConfig: GameRules<PieceNames>;
            moves: gameMove[];
        }) => {
            runErrorTest(rulesConfig, moves);
        }
    );
});

function runGeneralTest<PieceNames extends string[]>(
    rulesConfig: GameRules<PieceNames>,
    moves: gameMove[],
    expectedBoard: (string | undefined)[][]
) {
    const engine = new GameEngine(rulesConfig);

    moves.forEach(([targetPosition, destinationPosition]: gameMove) => {
        engine.makeMove(targetPosition, destinationPosition);
    });

    assertBoardPosition(engine, expectedBoard);
}

function runErrorTest<PieceNames extends string[]>(
    rulesConfig: GameRules<PieceNames>,
    moves: gameMove[]
) {
    const engine = new GameEngine(rulesConfig);

    for (let i = 0; i < moves.length - 1; i++) {
        //execute all but final move
        const [targetPosition, destinationPosition] = moves[i];
        engine.makeMove(targetPosition, destinationPosition);
    }

    const [finalTarget, finalDestination] = moves[moves.length - 1];

    expect(() => {
        engine.makeMove(finalTarget, finalDestination);
    }).toThrow(IllegalMoveError);
}
