import { BoardPosition } from '../common';
import { PlayerColor } from './rules';

export type PieceConfig<PieceNames extends string[]> = {
    name: PieceNames[keyof PieceNames] & string;
    notation: string;
    displayCharacters: Partial<Record<PlayerColor, string>>;
    moves: Move<PieceNames>[];
    startingPositions: Partial<Record<PlayerColor, BoardPosition[]>>;
};

type MoveBase<PieceNames extends string[]> = {
    type: string;
    name: string; //used for identifying specific moves. Mostly needed for en passant
    captureAvailability: CaptureAvailability;
    moveConditions?: MoveCondition<PieceNames>[];
};

export type StandardMove<PieceNames extends string[]> = MoveBase<PieceNames> & {
    type: 'standard';
    directions: Direction[] | 'all';
    maxSpaces: number | 'unlimited';
    minSpaces?: number;
    //relative location based on player position
    alternateCaptureLocations?: {
        direction: Direction;
        numSpaces: number;
    }[];
};

export type JumpMove<PieceNames extends string[]> = MoveBase<PieceNames> & {
    type: 'jump';
    jumpCoordinates: {
        horizontalSpaces: number;
        verticalSpaces: number;
    }[];
};

export type PromotionMove<PieceNames extends string[]> =
    MoveBase<PieceNames> & {
        type: 'promotion';
        directions: Direction[] | 'all';
        maxSpaces: number | 'unlimited';
        minSpaces?: number;
        promotionSquares: {
            playerColor: PlayerColor;
            positions: BoardPosition[];
        }[];
        promotionTargets: (PieceNames[keyof PieceNames] & string)[];
    };

export type CastleMove<PieceNames extends string[]> = MoveBase<PieceNames> & {
    type: 'castle';
    targetPiece: {
        name: PieceNames[keyof PieceNames] & string;
        playerColor: PlayerColor;
        location: BoardPosition;
    }[];
    resultLocation: {
        playerColor: PlayerColor;
        location: BoardPosition;
        targetPieceLocation: BoardPosition;
    }[];
};

export type Move<PieceNames extends string[]> =
    | StandardMove<PieceNames>
    | JumpMove<PieceNames>
    | PromotionMove<PieceNames>
    | CastleMove<PieceNames>;

export type CaptureAvailability = 'optional' | 'required' | 'forbidden';

type MoveConditionBase = {
    condition: string;
};

type ConditionOtherPieceHasNotMoved<PieceNames extends string[]> =
    MoveConditionBase & {
        condition: 'otherPieceHasNotMoved';
        piece: PieceNames[keyof PieceNames] & string;
        piecePosition: {
            playerColor: PlayerColor;
            position: BoardPosition;
        }[];
    };

type ConditionFirstPieceMove = MoveConditionBase & {
    condition: 'firstPieceMove';
};

type SpecificPreviousMove<PieceNames extends string[]> = MoveConditionBase & {
    condition: 'specificPreviousMove';
    previousMoveName: string;
    pieces: (PieceNames[keyof PieceNames] & string)[];
    locations: {
        direction: Direction;
        numSpaces: number;
    }[];
};

export type MoveCondition<PieceNames extends string[]> =
    | ConditionFirstPieceMove
    | SpecificPreviousMove<PieceNames>
    | ConditionOtherPieceHasNotMoved<PieceNames>;

//directions are relative to the player's position
export type Direction =
    | 'forward'
    | 'backward'
    | 'left'
    | 'right'
    | 'leftForward'
    | 'rightForward'
    | 'leftBackward'
    | 'rightBackward';
