import { Piece } from './pieces';

export type GameRules = {
    name: string;
    players: Player[];
    board: RectangularBoard;
    pieces: Piece[];
    winConditions: WinCondition[];
    drawConditions: DrawCondition[];
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

type CheckMate = WinConditionBase & {
    condition: 'checkmate';
    checkmatePiece: string; //todo: enforce piece names via type system
};

type WinCondition = Resign | CheckMate;

type DrawConditionBase = {
    condition: string;
};

type DrawByRepetition = DrawConditionBase & {
    condition: 'drawByRepetition';
    repetitions: number;
};

//for implementing the 50 move rule
type ExcessiveMoveRule = DrawConditionBase & {
    condition: 'excessiveMoveRule';
    moveCount: number;
    capturesResetCount: boolean;
    piecesWhichResetCount: string[];
};

type DrawCondition = DrawByRepetition | ExcessiveMoveRule;

//todo: add other board types (long term todo)
export type RectangularBoard = {
    height: number;
    width: number;
};
