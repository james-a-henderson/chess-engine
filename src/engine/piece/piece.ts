import { BoardPosition } from '../../types';
import { PieceConfig, PlayerColor } from '../../types/configuration';

export class Piece<PieceNames extends string[]> {
    private _config: PieceConfig<PieceNames>;
    private _playerColor: PlayerColor;
    private _position: BoardPosition;

    constructor(
        config: PieceConfig<PieceNames>,
        playerColor: PlayerColor,
        startingPosition: BoardPosition
    ) {
        this._config = config;
        this._playerColor = playerColor;
        this._position = startingPosition;
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

    public getDisplayCharacter(): string {
        //we check in the game engine to make sure the display character player colors exist
        return this._config.displayCharacters[this._playerColor]!;
    }
}
