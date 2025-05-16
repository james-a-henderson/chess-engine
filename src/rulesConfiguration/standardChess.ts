import { GameRules } from '../types';

export const standardChessConfig: GameRules<
    ['pawn', 'king', 'queen', 'rook', 'bishop', 'knight']
> = {
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
            order: 1
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
            name: 'pawn',
            notation: '', //pawns have no piece name in algebreic notation
            displayCharacters: {
                white: '♙',
                black: '♟'
            },
            moves: [
                {
                    type: 'standard',
                    name: 'pawnMoveForward',
                    directions: ['forward'],
                    maxSpaces: 1,
                    captureAvailability: 'forbidden'
                },
                {
                    type: 'standard',
                    name: 'pawnCapture',
                    directions: ['leftForward', 'rightForward'],
                    maxSpaces: 1,
                    captureAvailability: 'required'
                },
                {
                    type: 'standard',
                    name: 'pawnDoubleMove',
                    directions: ['forward'],
                    maxSpaces: 2,
                    minSpaces: 2,
                    captureAvailability: 'forbidden',
                    moveConditions: [
                        {
                            condition: 'firstPieceMove'
                        }
                    ]
                },
                {
                    type: 'promotion',
                    name: 'pawnPromotion',
                    captureAvailability: 'forbidden',
                    directions: ['forward'],
                    maxSpaces: 1,
                    promotionSquares: [
                        {
                            playerColor: 'white',
                            positions: [
                                ['a', 8],
                                ['b', 8],
                                ['c', 8],
                                ['d', 8],
                                ['e', 8],
                                ['f', 8],
                                ['g', 8],
                                ['h', 8]
                            ]
                        },
                        {
                            playerColor: 'black',
                            positions: [
                                ['a', 1],
                                ['b', 1],
                                ['c', 1],
                                ['d', 1],
                                ['e', 1],
                                ['f', 1],
                                ['g', 1],
                                ['h', 1]
                            ]
                        }
                    ],
                    promotionTargets: ['knight', 'rook', 'bishop', 'queen']
                },
                {
                    type: 'promotion',
                    name: 'pawnPromotionCapture',
                    captureAvailability: 'required',
                    directions: ['leftForward', 'rightForward'],
                    maxSpaces: 1,
                    promotionSquares: [
                        {
                            playerColor: 'white',
                            positions: [
                                ['a', 8],
                                ['b', 8],
                                ['c', 8],
                                ['d', 8],
                                ['e', 8],
                                ['f', 8],
                                ['g', 8],
                                ['h', 8]
                            ]
                        },
                        {
                            playerColor: 'black',
                            positions: [
                                ['a', 1],
                                ['b', 1],
                                ['c', 1],
                                ['d', 1],
                                ['e', 1],
                                ['f', 1],
                                ['g', 1],
                                ['h', 1]
                            ]
                        }
                    ],
                    promotionTargets: ['knight', 'rook', 'bishop', 'queen']
                },
                {
                    type: 'standard',
                    name: 'enPassant',
                    captureAvailability: 'required',
                    directions: ['leftForward', 'rightForward'],
                    maxSpaces: 1,
                    moveConditions: [
                        {
                            condition: 'specificPreviousMove',
                            previousMoveName: 'pawnDoubleMove',
                            pieces: ['pawn'],
                            locations: [
                                {
                                    direction: 'left',
                                    numSpaces: 1
                                },
                                {
                                    direction: 'right',
                                    numSpaces: 1
                                }
                            ]
                        }
                    ]
                }
            ],
            startingPositions: {
                white: [
                    ['a', 2],
                    ['b', 2],
                    ['c', 2],
                    ['d', 2],
                    ['e', 2],
                    ['f', 2],
                    ['g', 2],
                    ['h', 2]
                ],
                black: [
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
        },
        {
            name: 'king',
            notation: 'K',
            displayCharacters: {
                white: '♔',
                black: '♚'
            },
            moves: [
                {
                    type: 'standard',
                    name: 'kingMove',
                    captureAvailability: 'optional',
                    directions: 'all',
                    maxSpaces: 1
                },
                {
                    type: 'castle',
                    name: 'kingsideCastle',
                    captureAvailability: 'forbidden',
                    targetPiece: [
                        {
                            playerColor: 'white',
                            name: 'rook',
                            location: ['h', 1]
                        },
                        {
                            playerColor: 'black',
                            name: 'rook',
                            location: ['h', 8]
                        }
                    ],
                    resultLocation: [
                        {
                            playerColor: 'white',
                            location: ['g', 1],
                            targetPieceLocation: ['f', 1]
                        },
                        {
                            playerColor: 'black',
                            location: ['g', 8],
                            targetPieceLocation: ['f', 8]
                        }
                    ]
                },
                {
                    type: 'castle',
                    name: 'queensideCastle',
                    captureAvailability: 'forbidden',
                    targetPiece: [
                        {
                            playerColor: 'white',
                            name: 'rook',
                            location: ['a', 1]
                        },
                        {
                            playerColor: 'black',
                            name: 'rook',
                            location: ['a', 8]
                        }
                    ],
                    resultLocation: [
                        {
                            playerColor: 'white',
                            location: ['c', 1],
                            targetPieceLocation: ['d', 1]
                        },
                        {
                            playerColor: 'black',
                            location: ['c', 8],
                            targetPieceLocation: ['d', 8]
                        }
                    ]
                }
            ],
            startingPositions: {
                white: [['e', 1]],
                black: [['e', 8]]
            }
        },
        {
            name: 'queen',
            notation: 'Q',
            displayCharacters: {
                white: '♕',
                black: '♛'
            },
            moves: [
                {
                    type: 'standard',
                    name: 'queenMove',
                    directions: 'all',
                    maxSpaces: 'unlimited',
                    captureAvailability: 'optional'
                }
            ],
            startingPositions: {
                white: [['d', 1]],
                black: [['d', 8]]
            }
        },
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
        },
        {
            name: 'bishop',
            notation: 'B',
            displayCharacters: {
                white: '♗',
                black: '♝'
            },
            moves: [
                {
                    type: 'standard',
                    name: 'bishopMove',
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
            startingPositions: {
                white: [
                    ['c', 1],
                    ['f', 1]
                ],
                black: [
                    ['c', 8],
                    ['f', 8]
                ]
            }
        },
        {
            name: 'knight',
            notation: 'N',
            displayCharacters: {
                white: '♘',
                black: '♞'
            },
            moves: [
                {
                    type: 'jump',
                    name: 'knightMove',
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
            startingPositions: {
                white: [
                    ['b', 1],
                    ['g', 1]
                ],
                black: [
                    ['b', 8],
                    ['g', 8]
                ]
            }
        }
    ]
};
