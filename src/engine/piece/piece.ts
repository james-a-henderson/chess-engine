import {
    AvailableMoves,
    BoardPosition,
    GetLegalMovesFunction,
    MoveOptions,
    MoveRecord,
    verifyLegalMoveFunction
} from '../../types';
import {
    PieceConfig,
    PlayerColor,
    RectangularBoardConfig
} from '../../types/configuration';
import { RectangularBoard } from '../board';
import { generateGetLegalMoveFunctions } from './moves';
import { generateVerifyLegalMoveFunction } from './moves/verifyMove';

export class Piece<PieceNames extends string[]> {
    private _config: PieceConfig<PieceNames>;
    private _playerColor: PlayerColor;
    private _verifyLegalMoveFunctions: verifyLegalMoveFunction<PieceNames>[] =
        [];
    private _getLegalMoveFunctions: GetLegalMovesFunction<PieceNames>[] = [];
    private _moveCount = 0;
    private _promotionConfig?: {
        promotionSquares: BoardPosition[];
        promotionTargets: PieceNames[keyof PieceNames][];
    };

    constructor(
        config: PieceConfig<PieceNames>,
        playerColor: PlayerColor,
        boardConfig: RectangularBoardConfig
    ) {
        this._config = config;
        this._playerColor = playerColor;

        if (config.promotionConfig?.promotionSquares[playerColor]) {
            this._promotionConfig = {
                promotionSquares:
                    config.promotionConfig.promotionSquares[playerColor],
                promotionTargets: config.promotionConfig.promotionTargets
            };
        }

        this.registerMoves(boardConfig);
    }

    get pieceName() {
        return this._config.name;
    }

    get playerColor() {
        return this._playerColor;
    }

    get moveCount() {
        return this._moveCount;
    }

    public increaseMoveCount() {
        this._moveCount++;
    }

    public getLegalMoves(
        board: RectangularBoard<PieceNames>,
        currentSpace: BoardPosition
    ): AvailableMoves {
        const availableMoves: AvailableMoves = {
            moves: [],
            captureMoves: [],
            spacesThreatened: [],
            specialMoves: []
        };

        for (const func of this._getLegalMoveFunctions) {
            const result = func(board, this, currentSpace);

            availableMoves.moves.push(...result.moves);
            availableMoves.captureMoves.push(...result.captureMoves);
            availableMoves.spacesThreatened.push(...result.spacesThreatened);

            if (result.specialMoves) {
                availableMoves.specialMoves!.push(...result.specialMoves);
            }
        }

        return availableMoves;
    }

    public hasLegalMove(
        board: RectangularBoard<PieceNames>,
        currentSpace: BoardPosition
    ): boolean {
        for (const func of this._getLegalMoveFunctions) {
            const availableMoves = func(board, this, currentSpace);
            if (
                availableMoves.moves.length > 0 ||
                (availableMoves.specialMoves &&
                    availableMoves.specialMoves.length > 0)
            ) {
                return true;
            }
        }

        return false;
    }

    public getDisplayCharacter(): string {
        //we check in the game engine to make sure the display character player colors exist
        return this._config.displayCharacters[this._playerColor]!;
    }

    public verifyMove(
        board: RectangularBoard<PieceNames>,
        currentSpace: BoardPosition,
        destination: BoardPosition,
        moveOptions?: MoveOptions<PieceNames>
    ): MoveRecord<PieceNames> | false {
        for (const func of this._verifyLegalMoveFunctions) {
            const result = func(
                board,
                this,
                currentSpace,
                destination,
                moveOptions
            );

            if (result) {
                //move is legal if one move function returns true
                //todo: ensure no move conflict
                return result;
            }
        }

        return false;
    }

    public verifyPromotionRules(
        destination: BoardPosition,
        promotionTarget?: PieceNames[keyof PieceNames]
    ): boolean {
        if (this.isPromotionSpace(destination)) {
            if (!promotionTarget) {
                return false; //must have promotion target specified on promotion space
            }

            if (
                this._promotionConfig?.promotionTargets.includes(
                    promotionTarget
                )
            ) {
                return true;
            }

            return false;
        } else if (promotionTarget) {
            return false; //cannot have promotion target if specified space is not promotion space
        }

        return true;
    }

    private isPromotionSpace(position: BoardPosition): boolean {
        if (!this._promotionConfig) {
            return false; //no promotion specified
        }

        for (const promotionPosition of this._promotionConfig
            .promotionSquares) {
            if (
                promotionPosition[0] === position[0] &&
                promotionPosition[1] === position[1]
            ) {
                return true;
            }
        }

        return false;
    }

    private registerMoves(boardConfig: RectangularBoardConfig) {
        this._config.moves.forEach((move) => {
            this._verifyLegalMoveFunctions.push(
                generateVerifyLegalMoveFunction(move, boardConfig)
            );
            this._getLegalMoveFunctions.push(
                generateGetLegalMoveFunctions(move, boardConfig)
            );
        });
    }
}
