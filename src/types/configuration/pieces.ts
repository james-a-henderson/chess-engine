import { BoardPosition } from '../common';
import { PlayerColor } from './rules';

export type PieceConfig<PieceNames extends string[]> = {
    name: PieceNames[keyof PieceNames];
    notation: string;
    displayCharacters: Partial<Record<PlayerColor, string>>;
    moves: Move<PieceNames>[];
    startingPositions: Partial<Record<PlayerColor, BoardPosition[]>>;
    promotionConfig?: PromotionConfig<PieceNames>;
};

export type PromotionConfig<PieceNames extends string[]> = {
    promotionSquares: Partial<Record<PlayerColor, BoardPosition[]>>;
    promotionTargets: PieceNames[keyof PieceNames][];
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

export type CastleConfigForColor<PieceNames extends string[]> = {
    origin: BoardPosition;
    destination: BoardPosition;
    targetPieceName: PieceNames[keyof PieceNames];
    targetPieceOrigin: BoardPosition;
    targetPieceDestination: BoardPosition;
};

export type CastleMove<PieceNames extends string[]> = MoveBase<PieceNames> & {
    type: 'castle';
    configForColor: Partial<
        Record<PlayerColor, CastleConfigForColor<PieceNames>>
    >;
};

export type Move<PieceNames extends string[]> =
    | StandardMove<PieceNames>
    | JumpMove<PieceNames>
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

type SpacesNotThreatened = MoveConditionBase & {
    condition: 'spacesNotThreatened';
    spacesForColor: Partial<Record<PlayerColor, BoardPosition[]>>;
};

export type MoveCondition<PieceNames extends string[]> =
    | ConditionFirstPieceMove
    | SpecificPreviousMove<PieceNames>
    | ConditionOtherPieceHasNotMoved<PieceNames>
    | SpacesNotThreatened;

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
