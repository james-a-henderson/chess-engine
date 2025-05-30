import {
    GameError,
    PiecePlacement,
    RectangularBoardConfig
} from '../../../types';
import { Piece } from '../../piece';
import { RectangularBoard } from '../rectangularBoard';
import { pieceIsInCheck } from './pieceIsInCheck';

type testPieceNames = ['king', 'attacker'];

describe('pieceIsInCheck', () => {
    const testBoardConfig: RectangularBoardConfig = {
        width: 3,
        height: 3
    };
    test('returns true if white piece is in check', () => {
        const piecePlacements: PiecePlacement<testPieceNames>[] = [
            {
                piece: {
                    playerColor: 'black',
                    pieceName: 'attacker',
                    verifyMove: () => {
                        return {
                            moveName: 'test',
                            destinationSpace: ['a', 3],
                            originSpace: ['c', 3],
                            pieceColor: 'black',
                            pieceName: 'attacker'
                        };
                    }
                } as unknown as Piece<testPieceNames>,
                position: ['c', 3]
            },
            {
                piece: {
                    playerColor: 'black',
                    pieceName: 'attacker',
                    verifyMove: () => {
                        return false;
                    }
                } as unknown as Piece<testPieceNames>,
                position: ['c', 2]
            },
            {
                piece: {
                    playerColor: 'black',
                    pieceName: 'king',
                    verifyMove: () => {
                        return false;
                    }
                } as unknown as Piece<testPieceNames>,
                position: ['c', 1]
            },
            {
                piece: {
                    playerColor: 'white',
                    pieceName: 'king',
                    verifyMove: () => {
                        return false;
                    }
                } as unknown as Piece<testPieceNames>,
                position: ['a', 3]
            }
        ];

        const board = new RectangularBoard(testBoardConfig, piecePlacements);
        const result = pieceIsInCheck(board, 'king', 'white');
        expect(result).toEqual(true);
    });

    test('returns false if white piece is not in check', () => {
        const piecePlacements: PiecePlacement<testPieceNames>[] = [
            {
                piece: {
                    playerColor: 'black',
                    pieceName: 'attacker',
                    verifyMove: () => {
                        return false;
                    }
                } as unknown as Piece<testPieceNames>,
                position: ['c', 3]
            },
            {
                piece: {
                    playerColor: 'black',
                    pieceName: 'attacker',
                    verifyMove: () => {
                        return false;
                    }
                } as unknown as Piece<testPieceNames>,
                position: ['c', 2]
            },
            {
                piece: {
                    playerColor: 'black',
                    pieceName: 'king',
                    verifyMove: () => {
                        return false;
                    }
                } as unknown as Piece<testPieceNames>,
                position: ['c', 1]
            },
            {
                piece: {
                    playerColor: 'white',
                    pieceName: 'king',
                    verifyMove: () => {
                        return false;
                    }
                } as unknown as Piece<testPieceNames>,
                position: ['a', 3]
            }
        ];

        const board = new RectangularBoard(testBoardConfig, piecePlacements);
        const result = pieceIsInCheck(board, 'king', 'white');
        expect(result).toEqual(false);
    });

    test('returns true if black piece is in check', () => {
        const piecePlacements: PiecePlacement<testPieceNames>[] = [
            {
                piece: {
                    playerColor: 'white',
                    pieceName: 'attacker',
                    verifyMove: () => {
                        return {
                            moveName: 'test',
                            destinationSpace: ['c', 3],
                            originSpace: ['a', 3],
                            pieceColor: 'black',
                            pieceName: 'attacker'
                        };
                    }
                } as unknown as Piece<testPieceNames>,
                position: ['a', 3]
            },
            {
                piece: {
                    playerColor: 'white',
                    pieceName: 'attacker',
                    verifyMove: () => {
                        return false;
                    }
                } as unknown as Piece<testPieceNames>,
                position: ['a', 2]
            },
            {
                piece: {
                    playerColor: 'white',
                    pieceName: 'king',
                    verifyMove: () => {
                        return false;
                    }
                } as unknown as Piece<testPieceNames>,
                position: ['a', 1]
            },
            {
                piece: {
                    playerColor: 'black',
                    pieceName: 'king',
                    verifyMove: () => {
                        return false;
                    }
                } as unknown as Piece<testPieceNames>,
                position: ['c', 3]
            }
        ];

        const board = new RectangularBoard(testBoardConfig, piecePlacements);
        const result = pieceIsInCheck(board, 'king', 'black');
        expect(result).toEqual(true);
    });

    test('returns false if white piece is not in check', () => {
        const piecePlacements: PiecePlacement<testPieceNames>[] = [
            {
                piece: {
                    playerColor: 'white',
                    pieceName: 'attacker',
                    verifyMove: () => {
                        return false;
                    }
                } as unknown as Piece<testPieceNames>,
                position: ['a', 3]
            },
            {
                piece: {
                    playerColor: 'white',
                    pieceName: 'attacker',
                    verifyMove: () => {
                        return false;
                    }
                } as unknown as Piece<testPieceNames>,
                position: ['a', 2]
            },
            {
                piece: {
                    playerColor: 'white',
                    pieceName: 'king',
                    verifyMove: () => {
                        return false;
                    }
                } as unknown as Piece<testPieceNames>,
                position: ['a', 1]
            },
            {
                piece: {
                    playerColor: 'black',
                    pieceName: 'king',
                    verifyMove: () => {
                        return false;
                    }
                } as unknown as Piece<testPieceNames>,
                position: ['c', 3]
            }
        ];

        const board = new RectangularBoard(testBoardConfig, piecePlacements);
        const result = pieceIsInCheck(board, 'king', 'white');
        expect(result).toEqual(false);
    });

    test('throws error if no check pieces are found', () => {
        const piecePlacements: PiecePlacement<testPieceNames>[] = [
            {
                piece: {
                    playerColor: 'white',
                    pieceName: 'attacker',
                    verifyMove: () => {
                        return {
                            moveName: 'test',
                            destinationSpace: ['c', 3],
                            originSpace: ['a', 3],
                            pieceColor: 'black',
                            pieceName: 'attacker'
                        };
                    }
                } as unknown as Piece<testPieceNames>,
                position: ['a', 3]
            },
            {
                piece: {
                    playerColor: 'white',
                    pieceName: 'attacker',
                    verifyMove: () => {
                        return false;
                    }
                } as unknown as Piece<testPieceNames>,
                position: ['a', 2]
            },
            {
                piece: {
                    playerColor: 'white',
                    pieceName: 'king',
                    verifyMove: () => {
                        return false;
                    }
                } as unknown as Piece<testPieceNames>,
                position: ['a', 1]
            },
            {
                piece: {
                    playerColor: 'black',
                    pieceName: 'attacker',
                    verifyMove: () => {
                        return false;
                    }
                } as unknown as Piece<testPieceNames>,
                position: ['c', 3]
            }
        ];

        const board = new RectangularBoard(testBoardConfig, piecePlacements);
        expect(() => pieceIsInCheck(board, 'king', 'black')).toThrow(GameError);
    });

    test('throws error if multiple check pieces are found', () => {
        const piecePlacements: PiecePlacement<testPieceNames>[] = [
            {
                piece: {
                    playerColor: 'white',
                    pieceName: 'attacker',
                    verifyMove: () => {
                        return {
                            moveName: 'test',
                            destinationSpace: ['c', 3],
                            originSpace: ['a', 3],
                            pieceColor: 'black',
                            pieceName: 'attacker'
                        };
                    }
                } as unknown as Piece<testPieceNames>,
                position: ['a', 3]
            },
            {
                piece: {
                    playerColor: 'white',
                    pieceName: 'king',
                    verifyMove: () => {
                        return false;
                    }
                } as unknown as Piece<testPieceNames>,
                position: ['a', 2]
            },
            {
                piece: {
                    playerColor: 'white',
                    pieceName: 'king',
                    verifyMove: () => {
                        return false;
                    }
                } as unknown as Piece<testPieceNames>,
                position: ['a', 1]
            },
            {
                piece: {
                    playerColor: 'black',
                    pieceName: 'king',
                    verifyMove: () => {
                        return false;
                    }
                } as unknown as Piece<testPieceNames>,
                position: ['c', 3]
            }
        ];

        const board = new RectangularBoard(testBoardConfig, piecePlacements);
        expect(() => pieceIsInCheck(board, 'king', 'white')).toThrow(GameError);
    });
});
