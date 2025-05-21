import { BoardPosition, verifyLegalMoveFunction } from '../../types';
import {
    PieceConfig,
    PlayerColor,
    RectangularBoard
} from '../../types/configuration';
import { GameEngine } from '../GameEngine';
import { generateVerifyLegalMoveFunctions } from './moves';

export class Piece<PieceNames extends string[]> {
    private _config: PieceConfig<PieceNames>;
    private _playerColor: PlayerColor;
    private _position: BoardPosition;
    private _verifyLegalMoveFunctions: verifyLegalMoveFunction<PieceNames>[] =
        [];

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
    }

    public getDisplayCharacter(): string {
        //we check in the game engine to make sure the display character player colors exist
        return this._config.displayCharacters[this._playerColor]!;
    }

    public verifyMove(
        engine: GameEngine<PieceNames>,
        destination: BoardPosition
    ): boolean {
        this._verifyLegalMoveFunctions.forEach((func) => {
            if (func(engine, this, destination)) {
                //move is legal if one move function returns true
                //todo: ensure no move conflict
                return true;
            }
        });

        return false;
    }

    private registerMoves(boardConfig: RectangularBoard) {
        this._config.moves.forEach((move) => {
            this._verifyLegalMoveFunctions.push(
                ...generateVerifyLegalMoveFunctions(
                    move,
                    this._playerColor,
                    boardConfig
                )
            );
        });
    }
}
