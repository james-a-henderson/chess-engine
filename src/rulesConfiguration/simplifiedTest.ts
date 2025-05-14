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
                    name: 'rookMove',
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
