import { GameRules } from '../types';

export const testConfig: GameRules<['rook']> = {
    name: 'test',
    board: {
        height: 8,
        width: 8
    },
    players: [
        {
            color: 'white',
            order: 0
        },
        {
            color: 'black',
            order: 1
        }
    ],
    winConditions: [
        {
            condition: 'resign'
        }
    ],
    drawConditions: [],
    pieces: [
        {
            name: 'rook',
            notation: 'R',
            displayCharacters: {
                white: '♖',
                black: '♜'
            },
            moves: [
                {
                    type: 'standard',
                    name: 'rookMove',
                    directions: ['forward', 'backward', 'left', 'right'],
                    maxSpaces: 'unlimited',
                    captureAvailability: 'optional'
                }
            ],
            startingPositions: {
                white: [
                    ['a', 1],
                    ['h', 1]
                ],
                black: [
                    ['a', 8],
                    ['h', 8]
                ]
            }
        }
    ]
};
