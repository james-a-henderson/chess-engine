import {
    GameRules,
    PieceConfig,
    Player,
    PlayerColor
} from '../types/configuration';
import { BoardPosition, MAXIMUM_BOARD_SIZE } from '../types';
import { Piece } from './piece';
import {
    BoardConfigurationError,
    PieceConfigurationError,
    PlayerConfigurationError,
    InvalidSpaceError
} from '../types/errors';
import { BoardSpace, Board } from '../types/engine';
import { fileLetterToIndex, indexToFileLetter } from '../common';
import { styleText } from 'node:util';

export class GameEngine<PieceNames extends string[]> {
    private _players: Player[];
    private _board: Board<PieceNames>;
    private _config: GameRules<PieceNames>;

    constructor(rules: GameRules<PieceNames>) {
        this._config = rules;
        this._board = this.generateEmptyBoard();
        this._players = this.validatePlayerConfiguration();
        this.registerPieces();
        this.placePieces();
    }

    get board() {
        return this._board;
    }

    //outputs the board to the console in a human-readable format
    //note that the output quality may vary based on console settings
    public printBoard() {
        let outputString = '';
        for (let i = this._config.board.height - 1; i >= 0; i--) {
            let rowString = '';
            for (let j = 0; j < this._config.board.width; j++) {
                const space = this._board[j][i];

                const backGroundColor =
                    (i + j) % 2 === 0 ? 'bgGray' : 'bgWhite';

                if (!space.piece) {
                    rowString += styleText(backGroundColor, '   ');
                } else {
                    rowString += styleText(
                        [backGroundColor, 'black'],
                        ' ' + space.piece.getDisplayCharacter() + ' '
                    );
                }
            }
            outputString += rowString + '\n';
        }
        console.log(outputString);
    }

    private generateEmptyBoard(): Board<PieceNames> {
        if (
            !Number.isSafeInteger(this._config.board.width) ||
            !Number.isSafeInteger(this._config.board.height) ||
            this._config.board.width <= 0 ||
            this._config.board.width > MAXIMUM_BOARD_SIZE ||
            this._config.board.height <= 0 ||
            this._config.board.height > MAXIMUM_BOARD_SIZE
        ) {
            throw new BoardConfigurationError('invalid board size');
        }

        const board: Board<PieceNames> = [];

        for (let i = 0; i < this._config.board.width; i++) {
            const file: BoardSpace<PieceNames>[] = [];
            for (let j = 0; j < this._config.board.height; j++) {
                file.push({
                    position: this.indiciesToCoordinates([i, j]),
                    piece: undefined
                });
            }
            board.push(file);
        }

        return board;
    }

    private placePieces() {
        this._config.pieces.forEach((pieceConfig: PieceConfig<PieceNames>) => {
            Object.entries(pieceConfig.startingPositions).forEach(
                ([k, startingPositions]) => {
                    const playerColor = k as PlayerColor;
                    startingPositions.forEach((position) => {
                        const piece = new Piece(
                            pieceConfig,
                            playerColor,
                            position
                        );
                        const [fileIndex, rankIndex] =
                            this.coordinatesToIndicies(position);

                        const boardPosition = this._board[fileIndex][rankIndex];

                        if (boardPosition.piece) {
                            throw new PieceConfigurationError(
                                pieceConfig.name,
                                'Multiple pieces cannot have the same starting position'
                            );
                        }
                        boardPosition.piece = piece;
                    });
                }
            );
        });
    }

    private validatePlayerConfiguration(): Player[] {
        if (this._config.players.length < 2) {
            throw new PlayerConfigurationError('Must have at least 2 players');
        }

        const colors = new Set();
        const orders = new Set();
        this._config.players.forEach((player: Player) => {
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

        return this._config.players.toSorted((a, b) => {
            return a.order - b.order;
        });
    }

    private registerPieces() {
        const notations = new Set();
        const displayCharacters = new Set();
        const pieceNames = new Set();

        this._config.pieces.forEach((piece: PieceConfig<PieceNames>) => {
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

            if (
                Object.keys(piece.displayCharacters).length !==
                this._players.length
            ) {
                throw new PieceConfigurationError(
                    piece.name,
                    'piece must have one display character per player'
                );
            }

            for (const [playerColor, displayCharacter] of Object.entries(
                piece.displayCharacters
            )) {
                this.assertPlayerColorExists(playerColor);

                if (displayCharacters.has(displayCharacter)) {
                    throw new PieceConfigurationError(
                        piece.name,
                        'piece display characters must be unique'
                    );
                }

                displayCharacters.add(displayCharacter);
            }
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
