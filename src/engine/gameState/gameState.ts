import {
    BoardPosition,
    MoveRecord,
    PlayerColor,
    RectangularBoardConfig
} from '../../types';

export type GameState<PieceNames extends string[]> = {
    board: BoardSpaceStatus<PieceNames>[][];
    boardConfig: RectangularBoardConfig;
    currentPlayer: PlayerColor;
    status: GameStatus;
    lastMove?: MoveRecord<PieceNames>;
};

export type PieceState<PieceNames extends string[]> = {
    name: PieceNames[keyof PieceNames];
    color: PlayerColor;
    moveCount: number;
};

//todo: rename something simpler after refactor
export type GameStatePiecePlacement<PieceNames extends string[]> = {
    position: BoardPosition;
    piece: PieceState<PieceNames>;
};

//todo: update name to something simpler
//BoardSpace name is already used throughout program, so using alternate name is easier for now
export type BoardSpaceStatus<PieceNames extends string[]> = {
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
