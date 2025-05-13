import { GameRules } from '../types';

export const testConfig: GameRules = {
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
            order: 0
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
            displayCharacters: [
                {
                    playerColor: 'white',
                    displayCharacter: '♖'
                },
                {
                    playerColor: 'black',
                    displayCharacter: '♜'
                }
            ],
            moves: [
                {
                    type: 'standard',
                    directions: ['forward', 'backward', 'left', 'right'],
                    maxSpaces: 'unlimited',
                    captureAvailability: 'optional'
                }
            ],
            startingPositions: [
                {
                    playerColor: 'white',
                    positions: [
                        ['a', 1],
                        ['h', 1]
                    ]
                },
                {
                    playerColor: 'black',
                    positions: [
                        ['a', 8],
                        ['h', 8]
                    ]
                }
            ]
        }
    ]
};
