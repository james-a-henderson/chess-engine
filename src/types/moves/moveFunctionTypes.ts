import { RectangularBoard } from '../../engine/board/rectangularBoard';
import { GameState } from '../../engine/gameState';
import { Piece } from '../../engine/piece';
import { BoardPosition } from '../common';
import { MoveRecord } from './moveRecord';

type MoveOptionsBase = {
    type: string;
};

export type CastleMoveOptions = MoveOptionsBase & {
    type: 'castle';
};

export type PromotionMoveOptions<PieceNames extends string[]> =
    MoveOptionsBase & {
        type: 'promotion';
        promotionTarget: PieceNames[keyof PieceNames];
    };

export type MoveOptions<PieceNames extends string[]> =
    | CastleMoveOptions
    | PromotionMoveOptions<PieceNames>; //will expand with promotion options later

export type verifyLegalMoveFunction<PieceNames extends string[]> = (
    board: RectangularBoard<PieceNames>,
    piece: Piece<PieceNames>,
    currentSpace: BoardPosition,
    destination: BoardPosition,
    previousMove?: MoveRecord<PieceNames>,
    moveOptions?: MoveOptions<PieceNames>
) => MoveRecord<PieceNames> | false;

export type verifyLegalMoveFunctionV2<PieceNames extends string[]> = (
    state: GameState<PieceNames>,
    origin: BoardPosition,
    destination: BoardPosition,
    getLegalMovesFunctions: LegalMovesForPiece<PieceNames>,
    previousMove?: MoveRecord<PieceNames>,
    moveOptions?: MoveOptions<PieceNames>
) => MoveRecord<PieceNames> | false;

type SpecialMoveBase = {
    type: string;
    destination: BoardPosition;
};

type SpecialMoveCastle = SpecialMoveBase & {
    type: 'castle';
};

export type SpecialMove = SpecialMoveCastle; //will add more special move types later

export type AvailableMoves = {
    moves: BoardPosition[];
    captureMoves: BoardPosition[];
    spacesThreatened: BoardPosition[]; //for determining if move causes king to move into check
    specialMoves?: SpecialMove[];
};

export type GetLegalMovesFunction<PieceNames extends string[]> = (
    board: RectangularBoard<PieceNames>,
    piece: Piece<PieceNames>,
    currentSpace: BoardPosition
) => AvailableMoves;

export type GetLegalMovesFunctionV2<PieceNames extends string[]> = (
    state: GameState<PieceNames>,
    origin: BoardPosition,
    getLegalMovesFunctions: LegalMovesForPiece<PieceNames>,
    previousMove?: MoveRecord<PieceNames>
) => AvailableMoves;

export type MoveConditionFunction<PieceNames extends string[]> = (
    piece: Piece<PieceNames>,
    board: RectangularBoard<PieceNames>,
    piecePosition: BoardPosition,
    previousMove?: MoveRecord<PieceNames>
) => boolean;

export type MoveConditionFunctionV2<PieceNames extends string[]> = (
    state: GameState<PieceNames>,
    props: {
        piecePosition: BoardPosition;
        previousMove?: MoveRecord<PieceNames>;
        getLegalMovesFunctions: LegalMovesForPiece<PieceNames>;
    }
) => boolean;

export function emptyGetMovesFunction(): AvailableMoves {
    return { moves: [], captureMoves: [], spacesThreatened: [] };
}

export function emptyVerifyMovesFunction(): false {
    return false;
}

export type VerifyMovesForPiece<PieceNames extends string[]> = Map<
    PieceNames[keyof PieceNames],
    verifyLegalMoveFunctionV2<PieceNames>[]
>;
export type LegalMovesForPiece<PieceNames extends string[]> = Map<
    PieceNames[keyof PieceNames],
    GetLegalMovesFunctionV2<PieceNames>[]
>;
