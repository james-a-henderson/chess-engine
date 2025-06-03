import { BoardPosition } from '../common';
import { PlayerColor } from './rules';

export type PieceConfig<PieceNames extends string[]> = {
    name: PieceNames[keyof PieceNames];
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

export type JumpCoordinate = {
    horizontalSpaces: number;
    verticalSpaces: number;
};

export type JumpMove<PieceNames extends string[]> = MoveBase<PieceNames> & {
    type: 'jump';
    jumpCoordinates: JumpCoordinate[];
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
        piece: PieceNames[keyof PieceNames];
        piecePositionForColor: Partial<Record<PlayerColor, BoardPosition>>;
    };

type ConditionFirstPieceMove = MoveConditionBase & {
    condition: 'firstPieceMove';
};

type SpecificPreviousMove<PieceNames extends string[]> = MoveConditionBase & {
    condition: 'specificPreviousMove';
    previousMoveName: string;
    pieces: PieceNames[keyof PieceNames][];
    locations: {
        direction: Direction;
        numSpaces: number;
    }[];
};

type SpacesAreNotThreatened = MoveConditionBase & {
    condition: 'spacesAreNotThreatened';
    spacesForColor: Partial<Record<PlayerColor, BoardPosition[]>>;
};

export type MoveCondition<PieceNames extends string[]> =
    | ConditionFirstPieceMove
    | SpecificPreviousMove<PieceNames>
    | ConditionOtherPieceHasNotMoved<PieceNames>
    | SpacesAreNotThreatened;

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
