import {
    BoardPosition,
    MoveRecord,
    PlayerColor,
    RectangularBoardConfig
} from '../../types';

export type GameState<PieceNames extends string[]> = {
    board: BoardSpace<PieceNames>[][];
    boardConfig: RectangularBoardConfig;
    currentPlayer: PlayerColor;
    status: GameStatus;
    capturedPieces: Record<PlayerColor, PieceState<PieceNames>[]>;
    lastMove?: MoveRecord<PieceNames>;
};

export type PieceState<PieceNames extends string[]> = {
    name: PieceNames[keyof PieceNames];
    color: PlayerColor;
    moveCount: number;
};

export type PiecePlacement<PieceNames extends string[]> = {
    position: BoardPosition;
    piece: PieceState<PieceNames>;
};

export type BoardSpace<PieceNames extends string[]> = {
    position: BoardPosition;
    piece?: PieceState<PieceNames>;
};

type GameStatusBase = {
    status: string;
};

type GameStatusInProgress = GameStatusBase & {
    status: 'inProgress';
};

type GameStatusWin = GameStatusBase & {
    status: 'victory';
    winningPlayer: PlayerColor;
};

type GameStatusDraw = GameStatusBase & {
    status: 'draw';
};

type GameStatus = GameStatusInProgress | GameStatusWin | GameStatusDraw;
