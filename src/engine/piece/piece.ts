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

    constructor(
        config: PieceConfig<PieceNames>,
        playerColor: PlayerColor,
        boardConfig: RectangularBoardConfig
    ) {
        this._config = config;
        this._playerColor = playerColor;

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
        moveOptions?: MoveOptions
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
