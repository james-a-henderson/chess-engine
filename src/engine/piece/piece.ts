import {
    BoardPosition,
    getLegalMovesFunction,
    LegalMove,
    MoveRecord,
    verifyLegalMoveFunction
} from '../../types';
import {
    PieceConfig,
    PlayerColor,
    RectangularBoard
} from '../../types/configuration';
import { GameEngine } from '../GameEngine';
import { generateGetLegalMoveFunctions } from './moves';
import { generateVerifyLegalMoveFunctions } from './moves/verifyMove';

export class Piece<PieceNames extends string[]> {
    private _config: PieceConfig<PieceNames>;
    private _playerColor: PlayerColor;
    private _position: BoardPosition;
    private _verifyLegalMoveFunctions: verifyLegalMoveFunction<PieceNames>[] =
        [];
    private _getLegalMoveFunctions: getLegalMovesFunction<PieceNames>[] = [];
    private _moveCount = 0;

    constructor(
        config: PieceConfig<PieceNames>,
        playerColor: PlayerColor,
        startingPosition: BoardPosition,
        boardConfig: RectangularBoard
    ) {
        this._config = config;
        this._playerColor = playerColor;
        this._position = startingPosition;

        this.registerMoves(boardConfig);
    }

    get pieceName() {
        return this._config.name;
    }

    get playerColor() {
        return this._playerColor;
    }

    get position() {
        return this._position;
    }

    set position(position: BoardPosition) {
        this._position = position;
        this._moveCount++;
    }

    get moveCount() {
        return this._moveCount;
    }

    public getLegalMoves(engine: GameEngine<PieceNames>): LegalMove[] {
        const moves: LegalMove[] = [];

        for (const func of this._getLegalMoveFunctions) {
            moves.push(...func(engine, this));
        }

        return moves;
    }

    public hasLegalMove(engine: GameEngine<PieceNames>): boolean {
        for (const func of this._getLegalMoveFunctions) {
            const moves = func(engine, this);
            if (moves.length > 0) {
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
        destination: BoardPosition
    ): MoveRecord<PieceNames> | false {
        for (const func of this._verifyLegalMoveFunctions) {
            const result = func(engine, this, destination);

            if (result) {
                //move is legal if one move function returns true
                //todo: ensure no move conflict
                return result;
            }
        }

        return false;
    }

    private registerMoves(boardConfig: RectangularBoard) {
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
