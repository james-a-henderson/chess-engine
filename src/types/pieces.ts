import { BoardPosition } from './common';
import { PlayerColor } from './rules';

export type Piece = {
    name: string;
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
    captureAvailability: CaptureAvailability;
    moveConditions?: MoveCondition[];
};

type StandardMove = MoveBase & {
    type: 'standard';
    directions: Direction[] | 'all';
    maxSpaces: number | 'unlimited';
    minSpaces?: number;
};

type JumpMove = MoveBase & {
    type: 'jump';
    jumpCoordinates: {
        horizontalSpaces: number;
        verticalSpaces: number;
    }[];
};

type Move = StandardMove | JumpMove;

type CaptureAvailability = 'optional' | 'required' | 'forbidden';

type MoveCondition = 'firstPieceMove';

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
