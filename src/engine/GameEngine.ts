import {
    GameRules,
    PieceConfig,
    Player,
    PlayerColor
} from '../types/configuration';
import { BoardPosition, MoveRecord } from '../types';
import { Piece } from './piece';
import {
    PieceConfigurationError,
    PlayerConfigurationError,
    IllegalMoveError
} from '../types/errors';
import { BoardSpace, PiecePlacement } from '../types/engine';
import { styleText } from 'node:util';
import { RectangularBoard } from './board/rectangularBoard';

export class GameEngine<PieceNames extends string[]> {
    private _players: Player[];
    private _board: RectangularBoard<PieceNames>;
    private _config: GameRules<PieceNames>;
    private _capturedPieces: Partial<Record<PlayerColor, PieceNames[]>> = {};
    private _currentPlayer: PlayerColor;
    private _moves: MoveRecord<PieceNames>[] = [];

    constructor(rules: GameRules<PieceNames>) {
        this._config = rules;

        this._players = this.validatePlayerConfiguration();

        this._currentPlayer = this._players[0].color;

        this._players.forEach((player: Player) => {
            this._capturedPieces[player.color] = [];
        });

        this.validatePieceConfig();
        const piecePlacements = this.initializePieces();

        this._board = new RectangularBoard(this._config.board, piecePlacements);
    }

    get board() {
        return this._board;
    }

    get currentPlayer() {
        return this._currentPlayer;
    }

    get capturedPieces() {
        return this._capturedPieces;
    }

    get moves() {
        return this._moves;
    }

    get lastMove() {
        return this._moves.at(-1);
    }

    //outputs the board to the console in a human-readable format
    //note that the output quality may vary based on console settings
    public printBoard() {
        let outputString = '';
        for (let i = this.board.height - 1; i >= 0; i--) {
            let rowString = '';
            for (let j = 0; j < this.board.width; j++) {
                const space = this._board.spaces[j][i];

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

    public getSpace(
        position: BoardPosition | [number, number]
    ): BoardSpace<PieceNames> {
        return this._board.getSpace(position);
    }

    public verifyMove(
        targetPosition: BoardPosition,
        destinationPosition: BoardPosition
    ): MoveRecord<PieceNames> | false {
        const targetSpace = this.getSpace(targetPosition);

        if (!targetSpace.piece) {
            return false;
        }

        if (targetSpace.piece.playerColor !== this._currentPlayer) {
            return false;
        }

        return targetSpace.piece.verifyMove(
            this,
            targetPosition,
            destinationPosition
        );
    }

    public makeMove(
        targetPosition: BoardPosition,
        destinationPosition: BoardPosition
    ) {
        const move = this.verifyMove(targetPosition, destinationPosition);

        if (!move) {
            throw new IllegalMoveError('Move is not legal');
        }

        const targetSpace = this.getSpace(targetPosition);
        const destinationSpace = this.getSpace(destinationPosition);

        if (destinationSpace.piece) {
            //we assume if we get to this point, the capture is valid
            //todo: handle en passant capture
            this.capturePiece(destinationPosition);
        }

        targetSpace.piece!.increaseMoveCount();

        destinationSpace.piece = targetSpace.piece;
        targetSpace.piece = undefined;
        this.updateCurrentPlayer();
        this._moves.push(move);
    }

    private updateCurrentPlayer() {
        let currentPlayerIndex = this._players.findIndex((player: Player) => {
            return player.color === this._currentPlayer;
        });

        if (currentPlayerIndex === -1) {
            //can't find current player
            throw new Error('Cannot find current player');
        }

        currentPlayerIndex++;
        if (currentPlayerIndex >= this._players.length) {
            currentPlayerIndex = 0;
        }

        this._currentPlayer = this._players[currentPlayerIndex].color;
    }

    private capturePiece(position: BoardPosition) {
        const space = this.getSpace(position);

        if (!space.piece) {
            throw new IllegalMoveError('Cannot capture an empty space');
        }

        this._capturedPieces[space.piece.playerColor]?.push(
            space.piece.pieceName as PieceNames
        );

        space.piece = undefined;
    }

    private initializePieces(): PiecePlacement<PieceNames>[] {
        const placements: PiecePlacement<PieceNames>[] = [];

        for (const pieceConfig of this._config.pieces) {
            for (const [color, startingPositions] of Object.entries(
                pieceConfig.startingPositions
            )) {
                const playerColor = color as PlayerColor;
                for (const position of startingPositions) {
                    const piece = new Piece(
                        pieceConfig,
                        playerColor,
                        this._config.board
                    );

                    placements.push({ piece: piece, position: position });
                }
            }
        }

        return placements;
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

    private validatePieceConfig() {
        const notations = new Set();
        const displayCharacters = new Set();
        const pieceNames = new Set();

        this._config.pieces.forEach((piece: PieceConfig<PieceNames>) => {
            if (pieceNames.has(piece.name)) {
                throw new PieceConfigurationError(
                    piece.name as string,
                    'piece names must be unique'
                );
            }
            pieceNames.add(piece.name);

            if (notations.has(piece.notation)) {
                throw new PieceConfigurationError(
                    piece.name as string,
                    'piece notations must be unique'
                );
            }
            notations.add(piece.notation);

            if (
                Object.keys(piece.displayCharacters).length !==
                this._players.length
            ) {
                throw new PieceConfigurationError(
                    piece.name as string,
                    'piece must have one display character per player'
                );
            }

            for (const [playerColor, displayCharacter] of Object.entries(
                piece.displayCharacters
            )) {
                this.assertPlayerColorExists(playerColor);

                if (displayCharacters.has(displayCharacter)) {
                    throw new PieceConfigurationError(
                        piece.name as string,
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
    public indiciesToCoordinates(indicies: [number, number]): BoardPosition {
        return this._board.indiciesToCoordinates(indicies);
    }

    public coordinatesToIndicies(coordinates: BoardPosition): [number, number] {
        return this._board.coordinatesToIndicies(coordinates);
    }
}
