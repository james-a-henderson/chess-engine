import {
    AvailableMoves,
    BoardPosition,
    getLegalMovesFunction,
    MoveRecord,
    verifyLegalMoveFunction
} from '../../types';
import {
    PieceConfig,
    PlayerColor,
    RectangularBoardConfig
} from '../../types/configuration';
import { GameEngine } from '../GameEngine';
import { generateGetLegalMoveFunctions } from './moves';
import { generateVerifyLegalMoveFunctions } from './moves/verifyMove';

export class Piece<PieceNames extends string[]> {
    private _config: PieceConfig<PieceNames>;
    private _playerColor: PlayerColor;
    private _verifyLegalMoveFunctions: verifyLegalMoveFunction<PieceNames>[] =
        [];
    private _getLegalMoveFunctions: getLegalMovesFunction<PieceNames>[] = [];
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
        engine: GameEngine<PieceNames>,
        currentSpace: BoardPosition
    ): AvailableMoves {
        const availableMoves: AvailableMoves = {
            moves: [],
            captureMoves: [],
            spacesThreatened: []
        };

        for (const func of this._getLegalMoveFunctions) {
            const result = func(engine, this, currentSpace);

            availableMoves.moves.push(...result.moves);
            availableMoves.captureMoves.push(...result.captureMoves);
            availableMoves.spacesThreatened.push(...result.spacesThreatened);
        }

        return availableMoves;
    }

    public hasLegalMove(
        engine: GameEngine<PieceNames>,
        currentSpace: BoardPosition
    ): boolean {
        for (const func of this._getLegalMoveFunctions) {
            const availableMoves = func(engine, this, currentSpace);
            if (availableMoves.moves.length > 0) {
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
        engine: GameEngine<PieceNames>,
        currentSpace: BoardPosition,
        destination: BoardPosition
    ): MoveRecord<PieceNames> | false {
        for (const func of this._verifyLegalMoveFunctions) {
            const result = func(engine, this, currentSpace, destination);

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
                ...generateVerifyLegalMoveFunctions(move, boardConfig)
            );
            this._getLegalMoveFunctions.push(
                generateGetLegalMoveFunctions(move, boardConfig)
            );
        });
    }
}
