import { GameRules } from '../types';

export const standardChessConfig: GameRules = {
    name: 'chess',
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
        },
        {
            condition: 'checkmate',
            checkmatePiece: 'king'
        }
    ],
    drawConditions: [
        {
            condition: 'drawByRepetition',
            repetitions: 3
        },
        {
            condition: 'excessiveMoveRule',
            moveCount: 50,
            capturesResetCount: true,
            piecesWhichResetCount: ['pawn']
        }
    ],
    pieces: [
        {
            //todo: add promotion rules
            //todo: add en passant rules
            name: 'pawn',
            displayCharacters: [
                {
                    playerColor: 'white',
                    displayCharacter: '♙'
                },
                {
                    playerColor: 'black',
                    displayCharacter: '♟'
                }
            ],
            moves: [
                {
                    type: 'standard',
                    directions: ['forward'],
                    maxSpaces: 1,
                    captureAvailability: 'forbidden'
                },
                {
                    type: 'standard',
                    directions: ['leftForward', 'rightForward'],
                    maxSpaces: 1,
                    captureAvailability: 'required'
                },
                {
                    type: 'standard',
                    directions: ['forward'],
                    maxSpaces: 2,
                    minSpaces: 2,
                    captureAvailability: 'forbidden',
                    moveConditions: ['firstPieceMove']
                }
            ],
            startingPositions: [
                {
                    playerColor: 'white',
                    positions: [
                        ['a', 2],
                        ['b', 2],
                        ['c', 2],
                        ['d', 2],
                        ['e', 2],
                        ['f', 2],
                        ['g', 2],
                        ['h', 2]
                    ]
                },
                {
                    playerColor: 'black',
                    positions: [
                        ['a', 7],
                        ['b', 7],
                        ['c', 7],
                        ['d', 7],
                        ['e', 7],
                        ['f', 7],
                        ['g', 7],
                        ['h', 7]
                    ]
                }
            ]
        },
        {
            //todo: add castling rules
            name: 'king',
            displayCharacters: [
                {
                    playerColor: 'white',
                    displayCharacter: '♔'
                },
                {
                    playerColor: 'black',
                    displayCharacter: '♚'
                }
            ],
            moves: [
                {
                    type: 'standard',
                    captureAvailability: 'optional',
                    directions: 'all',
                    maxSpaces: 1
                }
            ],
            startingPositions: [
                {
                    playerColor: 'white',
                    positions: [['e', 1]]
                },
                {
                    playerColor: 'black',
                    positions: [['e', 8]]
                }
            ]
        },
        {
            name: 'queen',
            displayCharacters: [
                {
                    playerColor: 'white',
                    displayCharacter: '♕'
                },
                {
                    playerColor: 'black',
                    displayCharacter: '♛'
                }
            ],
            moves: [
                {
                    type: 'standard',
                    directions: 'all',
                    maxSpaces: 'unlimited',
                    captureAvailability: 'optional'
                }
            ],
            startingPositions: [
                {
                    playerColor: 'white',
                    positions: [['d', 1]]
                },
                {
                    playerColor: 'black',
                    positions: [['d', 8]]
                }
            ]
        },
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
        },
        {
            name: 'bishop',
            displayCharacters: [
                {
                    playerColor: 'white',
                    displayCharacter: '♗'
                },
                {
                    playerColor: 'black',
                    displayCharacter: '♝'
                }
            ],
            moves: [
                {
                    type: 'standard',
                    directions: [
                        'leftForward',
                        'leftBackward',
                        'rightForward',
                        'rightBackward'
                    ],
                    maxSpaces: 'unlimited',
                    captureAvailability: 'optional'
                }
            ],
            startingPositions: [
                {
                    playerColor: 'white',
                    positions: [
                        ['c', 1],
                        ['f', 1]
                    ]
                },
                {
                    playerColor: 'black',
                    positions: [
                        ['c', 8],
                        ['f', 8]
                    ]
                }
            ]
        },
        {
            name: 'knight',
            displayCharacters: [
                {
                    playerColor: 'white',
                    displayCharacter: '♘'
                },
                {
                    playerColor: 'black',
                    displayCharacter: '♞'
                }
            ],
            moves: [
                {
                    type: 'jump',
                    captureAvailability: 'optional',
                    jumpCoordinates: [
                        {
                            horizontalSpaces: 2,
                            verticalSpaces: 1
                        },
                        {
                            horizontalSpaces: 1,
                            verticalSpaces: 2
                        }
                    ]
                }
            ],
            startingPositions: [
                {
                    playerColor: 'white',
                    positions: [
                        ['b', 1],
                        ['g', 1]
                    ]
                },
                {
                    playerColor: 'black',
                    positions: [
                        ['b', 8],
                        ['g', 8]
                    ]
                }
            ]
        }
    ]
};
