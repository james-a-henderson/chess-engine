import {
    BoardPosition,
    GameRules,
    MAXIMUM_BOARD_SIZE,
    PieceConfig,
    Player,
    RectangularBoard
} from '../types';
import { Piece } from './piece';
import {
    BoardConfigurationError,
    PieceConfigurationError,
    PlayerConfigurationError,
    InvalidSpaceError
} from '../types/errors';
import { fileLetterToIndex, indexToFileLetter } from '../common';

type BoardSpace<PieceNames extends string[]> = {
    position: BoardPosition;
    piece?: Piece<PieceNames>;
};

type Board<PieceNames extends string[]> = BoardSpace<PieceNames>[][];

export class GameEngine<PieceNames extends string[]> {
    private _players: Player[];
    private _board: Board<PieceNames>;
    private _config: GameRules<PieceNames>;

    constructor(rules: GameRules<PieceNames>) {
        this._config = rules;
        this._board = this.generateEmptyBoard(rules.board);
        this._players = this.validatePlayerConfiguration(rules.players);
        this.registerPieces(rules.pieces);
    }

    get board() {
        return this._board;
    }

    private generateEmptyBoard(
        boardConfig: RectangularBoard
    ): Board<PieceNames> {
        if (
            !Number.isSafeInteger(boardConfig.width) ||
            !Number.isSafeInteger(boardConfig.height) ||
            boardConfig.width <= 0 ||
            boardConfig.width > MAXIMUM_BOARD_SIZE || //somewhat arbrirtary maximum board size
            boardConfig.height <= 0 ||
            boardConfig.height > MAXIMUM_BOARD_SIZE
        ) {
            throw new BoardConfigurationError('invalid board size');
        }

        const board: Board<PieceNames> = [];

        for (let i = 0; i < boardConfig.width; i++) {
            const file: BoardSpace<PieceNames>[] = [];
            for (let j = 0; j < boardConfig.height; j++) {
                file.push({
                    position: this.indiciesToCoordinates([i, j]),
                    piece: undefined
                });
            }
            board.push(file);
        }

        return board;
    }

    private validatePlayerConfiguration(players: Player[]): Player[] {
        if (players.length < 2) {
            throw new PlayerConfigurationError('Must have at least 2 players');
        }

        const colors = new Set();
        const orders = new Set();
        players.forEach((player: Player) => {
            if (colors.has(player.color)) {
                throw new PlayerConfigurationError(
                    'Player colors must be unique'
                );
            }
            if (orders.has(player.order)) {
                throw new PlayerConfigurationError(
                    'Player orders must be unique'
                );
            }

            if (!Number.isSafeInteger(player.order)) {
                throw new PlayerConfigurationError(
                    'Player order must be safe integer'
                );
            }
            colors.add(player.color);
            orders.add(player.order);
        });

        return players.toSorted((a, b) => {
            return a.order - b.order;
        });
    }

    private registerPieces(pieces: PieceConfig<PieceNames>[]) {
        const notations = new Set();
        const displayCharacters = new Set();
        const pieceNames = new Set();

        pieces.forEach((piece: PieceConfig<PieceNames>) => {
            if (pieceNames.has(piece.name)) {
                throw new PieceConfigurationError(
                    piece.name,
                    'piece names must be unique'
                );
            }
            pieceNames.add(piece.name);

            if (notations.has(piece.notation)) {
                throw new PieceConfigurationError(
                    piece.name,
                    'piece notations must be unique'
                );
            }
            notations.add(piece.notation);

            if (piece.displayCharacters.length !== this._players.length) {
                throw new PieceConfigurationError(
                    piece.name,
                    'piece must have one display character per player'
                );
            }

            const displayCharacterPlayerColors = new Set();

            piece.displayCharacters.forEach((displayCharacterConfig) => {
                this.assertPlayerColorExists(
                    displayCharacterConfig.playerColor
                );

                if (
                    displayCharacterPlayerColors.has(
                        displayCharacterConfig.playerColor
                    )
                ) {
                    throw new PieceConfigurationError(
                        piece.name,
                        'pieces can only have one display character per player'
                    );
                }
                displayCharacterPlayerColors.add(
                    displayCharacterConfig.playerColor
                );

                if (
                    displayCharacters.has(
                        displayCharacterConfig.displayCharacter
                    )
                ) {
                    throw new PieceConfigurationError(
                        piece.name,
                        'piece display characters must be unique'
                    );
                }

                displayCharacters.add(displayCharacterConfig.displayCharacter);
            });
        });
    }

    private assertPlayerColorExists(color: string) {
        const playerIndex = this._players.findIndex((player) => {
            return player.color === color;
        });

        if (playerIndex === -1) {
            throw new PlayerConfigurationError(
                `player color ${color} does not exist`
            );
        }
    }

    /**
     * Translates two dimensional array indicies to chess coordinates
     *
     * For example, [0][4] would translate to a5
     * @param indicies
     */
    private indiciesToCoordinates(indicies: [number, number]): BoardPosition {
        if (
            indicies[0] >= this._config.board.width ||
            indicies[1] >= this._config.board.height ||
            indicies[0] < 0 ||
            indicies[1] < 0
        ) {
            throw new InvalidSpaceError('Invalid space index');
        }
        return [indexToFileLetter(indicies[0]), indicies[1] + 1];
    }

    private coordinatesToIndicies(
        coordinates: BoardPosition
    ): [number, number] {
        const fileIndex = fileLetterToIndex(coordinates[0]);
        const rankIndex = coordinates[1] - 1;

        if (
            fileIndex >= this._config.board.width ||
            rankIndex >= this._config.board.height ||
            fileIndex < 0 ||
            rankIndex < 0
        ) {
            throw new InvalidSpaceError('Invalid coordinates');
        }

        return [fileIndex, rankIndex];
    }
}
