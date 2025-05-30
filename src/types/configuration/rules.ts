import { PieceConfig } from './pieces';

export type GameRules<PieceNames extends string[]> = {
    name: string;
    players: Player[];
    board: RectangularBoardConfig;
    pieces: PieceConfig<PieceNames>[];
    winConditions: WinCondition<PieceNames>[];
    drawConditions: DrawCondition<PieceNames>[];
};

export type Player = {
    color: PlayerColor;
    order: number;
};

export type PlayerColor = 'white' | 'black';

type WinConditionBase = {
    condition: string;
};

type Resign = WinConditionBase & {
    condition: 'resign';
};

type CheckMate<PieceNames extends string[]> = WinConditionBase & {
    condition: 'checkmate';
    checkmatePiece: PieceNames[keyof PieceNames] & string;
};

type WinCondition<PieceNames extends string[]> = Resign | CheckMate<PieceNames>;

type DrawConditionBase = {
    condition: string;
};

type DrawByRepetition = DrawConditionBase & {
    condition: 'drawByRepetition';
    repetitions: number;
};

//for implementing the 50 move rule
type ExcessiveMoveRule<PieceNames extends string[]> = DrawConditionBase & {
    condition: 'excessiveMoveRule';
    moveCount: number;
    capturesResetCount: boolean;
    piecesWhichResetCount: (PieceNames[keyof PieceNames] & string)[];
};

type DrawCondition<PieceNames extends string[]> =
    | DrawByRepetition
    | ExcessiveMoveRule<PieceNames>;

//todo: add other board types (long term todo)
export type RectangularBoardConfig = {
    height: number;
    width: number;
};
