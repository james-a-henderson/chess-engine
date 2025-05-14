import { GameRules, PieceConfig, Player, RectangularBoard } from '../types';
import {
    BoardConfigurationError,
    PieceConfigurationError,
    PlayerConfigurationError
} from './validationErrors';

export class GameEngine<PieceNames extends string[]> {
    private players: Player[];
    private board: string[][];

    constructor(rules: GameRules<PieceNames>) {
        this.board = this.generateEmptyBoard(rules.board);
        this.players = this.validatePlayerConfiguration(rules.players);
        this.registerPieces(rules.pieces);
    }

    private generateEmptyBoard(boardConfig: RectangularBoard): string[][] {
        if (
            !Number.isSafeInteger(boardConfig.width) ||
            !Number.isSafeInteger(boardConfig.height) ||
            boardConfig.width <= 0 ||
            boardConfig.width > 1024 || //somewhat arbrirtary maximum board size
            boardConfig.height <= 0 ||
            boardConfig.height > 1024
        ) {
            throw new BoardConfigurationError('invalid board size');
        }

        //todo: change types to something more useful
        const board: string[][] = new Array<string[]>(boardConfig.width);
        board.fill(new Array<string>(boardConfig.height).fill(''));
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

            if (piece.displayCharacters.length !== this.players.length) {
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
        const playerIndex = this.players.findIndex((player) => {
            return player.color === color;
        });

        if (playerIndex === -1) {
            throw new PlayerConfigurationError(
                `player color ${color} does not exist`
            );
        }
    }
}
