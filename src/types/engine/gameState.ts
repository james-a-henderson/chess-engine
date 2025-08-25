import {
    BoardPosition,
    MoveRecord,
    PlayerColor,
    RectangularBoardConfig
} from '..';

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

export type GameStatusInProgress = GameStatusBase & {
    status: 'inProgress';
};

export type GameStatusWin = GameStatusBase & {
    status: 'victory';
    winningPlayer: PlayerColor;
};

type GameStatusDraw = GameStatusBase & {
    status: 'draw';
};

export type GameStatus = GameStatusInProgress | GameStatusWin | GameStatusDraw;
