import { BoardPosition } from './common';
import { PlayerColor } from './rules';

export type Piece = {
    name: string;
    notation: string;
    displayCharacters: {
        playerColor: PlayerColor;
        displayCharacter: string;
    }[];
    moves: Move[];
    startingPositions: {
        playerColor: PlayerColor;
        positions: BoardPosition[];
    }[];
};

type MoveBase = {
    type: string;
    name: string; //used for identifying specific moves. Mostly needed for en passant
    captureAvailability: CaptureAvailability;
    moveConditions?: MoveCondition[];
};

type StandardMove = MoveBase & {
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

type JumpMove = MoveBase & {
    type: 'jump';
    jumpCoordinates: {
        horizontalSpaces: number;
        verticalSpaces: number;
    }[];
};

type PromotionMove = MoveBase & {
    type: 'promotion';
    directions: Direction[] | 'all';
    maxSpaces: number | 'unlimited';
    minSpaces?: number;
    promotionSquares: {
        playerColor: PlayerColor;
        positions: BoardPosition[];
    }[];
    promotionTargets: string[];
};

type CastleMove = MoveBase & {
    type: 'castle';
    targetPiece: {
        name: string;
        playerColor: PlayerColor;
        location: BoardPosition;
    }[];
    resultLocation: {
        playerColor: PlayerColor;
        location: BoardPosition;
        targetPieceLocation: BoardPosition;
    }[];
};

type Move = StandardMove | JumpMove | PromotionMove | CastleMove;

type CaptureAvailability = 'optional' | 'required' | 'forbidden';

type MoveConditionBase = {
    condition: string;
};

type ConditionOtherPieceHasNotMoved = MoveConditionBase & {
    condition: 'otherPieceHasNotMoved';
    piece: string;
    piecePosition: {
        playerColor: PlayerColor;
        position: BoardPosition;
    }[];
};

type ConditionFirstPieceMove = MoveConditionBase & {
    condition: 'firstPieceMove';
};

type SpecificPreviousMove = MoveConditionBase & {
    condition: 'specificPreviousMove';
    previousMoveName: string;
    pieces: string[];
    locations: {
        direction: Direction;
        numSpaces: number;
    }[];
};

type MoveCondition =
    | ConditionFirstPieceMove
    | SpecificPreviousMove
    | ConditionOtherPieceHasNotMoved;

//directions are relative to the player's position
type Direction =
    | 'forward'
    | 'backward'
    | 'left'
    | 'right'
    | 'leftForward'
    | 'rightForward'
    | 'leftBackward'
    | 'rightBackward';
