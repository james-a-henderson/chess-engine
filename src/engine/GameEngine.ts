import {
    BoardPosition,
    GameError,
    GameRules,
    GetLegalMovesFunction,
    IllegalMoveError,
    LegalMovesForPiece,
    MoveOptions,
    MoveRecord,
    PieceConfig,
    PieceConfigurationError,
    Player,
    PlayerColor,
    PlayerConfigurationError,
    VerifyBoardStateFunction,
    verifyLegalMoveFunction,
    VerifyMovesForPiece
} from '../types';
import { generateCheckFunction, rectangularBoardHelper } from './board';
import {
    BoardSpace,
    GameState,
    PiecePlacement,
    updateGameState
} from './gameState';
import { generateGameState } from './gameState/generateGameState';
import {
    generateGetLegalMovesFunction,
    generateVerifyLegalMoveFunction
} from './piece/moves';

export class GameEngine<PieceNames extends string[]> {
    private _players: Player[];
    private _gameStates: GameState<PieceNames>[];
    private _config: GameRules<PieceNames>;

    private _verifyFunctions: VerifyMovesForPiece<PieceNames> = new Map();
    private _getMovesFunctions: LegalMovesForPiece<PieceNames> = new Map();

    private _verifyBoardFunctions: VerifyBoardStateFunction<PieceNames>[];

    constructor(rules: GameRules<PieceNames>) {
        this._config = rules;

        this._players = this.validatePlayerConfiguration();
        this.validatePieceConfig();

        this._gameStates = [this.generateInitialGameState()];

        this.generateMoveFunctions();

        this._verifyBoardFunctions = this.generateVerifyBoardStateFunctions();
    }

    get currentGameState(): GameState<PieceNames> {
        const state = this._gameStates.at(-1);

        if (!state) {
            //this shouldn't happen, as we initialize the game state in the constructor
            //this check is mostly for the TS compiler
            throw new GameError('Game state not initialized');
        }

        return state;
    }

    get currentBoard(): BoardSpace<PieceNames>[][] {
        return this.currentGameState.board;
    }

    get currentPlayer(): PlayerColor {
        return this.currentGameState.currentPlayer;
    }

    public getSpace(
        position: BoardPosition | [number, number]
    ): BoardSpace<PieceNames> {
        return rectangularBoardHelper.getSpace(this.currentGameState, position);
    }

    private getPieceConfig(
        pieceName: PieceNames[keyof PieceNames]
    ): PieceConfig<PieceNames> {
        for (const config of this._config.pieces) {
            if (config.name === pieceName) {
                return config;
            }
        }

        throw new PieceConfigurationError(
            pieceName,
            'Cannot find configuration for piece'
        );
    }

    public verifyMove(
        origin: BoardPosition,
        destination: BoardPosition,
        moveOptions?: MoveOptions<PieceNames>
    ): MoveRecord<PieceNames> | false {
        const originSpace = this.getSpace(origin);

        if (
            !originSpace.piece ||
            originSpace.piece.color !== this.currentPlayer
        ) {
            return false;
        }

        const verifyMoveFuncs = this._verifyFunctions.get(
            originSpace.piece.name
        );

        if (!verifyMoveFuncs) {
            return false;
        }

        for (const func of verifyMoveFuncs) {
            const result = func(
                this.currentGameState,
                origin,
                destination,
                this._getMovesFunctions,
                this.currentGameState.lastMove,
                moveOptions
            );

            if (result) {
                //move is legal if one move function returns true
                //todo: ensure no move conflict
                return this.verifyPromotionRules(result) ? result : false;
            }
        }

        return false;
    }

    private verifyPromotionRules(move: MoveRecord<PieceNames>): boolean {
        if (this.isPromotionSpace(move)) {
            if (!move.promotedTo) {
                return false;
            }

            const pieceConfig = this.getPieceConfig(move.pieceName);

            if (!pieceConfig.promotionConfig) {
                return false;
            }

            if (
                !pieceConfig.promotionConfig.promotionTargets.includes(
                    move.promotedTo
                )
            ) {
                return false;
            }
        } else if (move.promotedTo) {
            //cannot have promotion target if specfied space is not promotion space
            return false;
        }

        return true;
    }

    private isPromotionSpace(move: MoveRecord<PieceNames>): boolean {
        const pieceConfig = this.getPieceConfig(move.pieceName);

        if (!pieceConfig.promotionConfig) {
            return false; //no promotion configuration for piece
        }

        const promotionPositions =
            pieceConfig.promotionConfig.promotionSquares[move.pieceColor];

        if (!promotionPositions) {
            return false;
        }

        for (const promotionPosition of promotionPositions) {
            if (
                promotionPosition[0] === move.destinationSpace[0] &&
                promotionPosition[1] === move.destinationSpace[1]
            ) {
                return true;
            }
        }

        return false;
    }

    public makeMove(
        origin: BoardPosition,
        destination: BoardPosition,
        moveOptions?: MoveOptions<PieceNames>
    ) {
        const move = this.verifyMove(origin, destination, moveOptions);

        if (!move) {
            throw new IllegalMoveError('Move is not legal');
        }

        const newState = updateGameState(this.currentGameState, move);

        //check if newState is valid
        for (const func of this._verifyBoardFunctions) {
            if (
                !func(
                    newState,
                    this._verifyFunctions,
                    this._getMovesFunctions,
                    this.currentPlayer
                )
            ) {
                throw new IllegalMoveError('Resulting board state is invalid');
            }
        }

        this._gameStates.push(newState);
    }

    private generateInitialGameState(): GameState<PieceNames> {
        const placements: PiecePlacement<PieceNames>[] = [];

        for (const pieceConfig of this._config.pieces) {
            for (const [color, startingPositions] of Object.entries(
                pieceConfig.startingPositions
            )) {
                const playerColor = color as PlayerColor; //we know this must be a PlayerColor because startingPosition entries must be PlayerColor
                for (const position of startingPositions) {
                    placements.push({
                        piece: {
                            name: pieceConfig.name,
                            color: playerColor,
                            moveCount: 0
                        },
                        position: position
                    });
                }
            }
        }

        return generateGameState(
            placements,
            this._players[0].color,
            this._config.board
        );
    }

    private validatePlayerConfiguration() {
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

    private generateMoveFunctions() {
        for (const pieceConfig of this._config.pieces) {
            const verifyFuncs: verifyLegalMoveFunction<PieceNames>[] = [];
            const getMovesFuncs: GetLegalMovesFunction<PieceNames>[] = [];

            for (const moveConfig of pieceConfig.moves) {
                verifyFuncs.push(
                    generateVerifyLegalMoveFunction(
                        pieceConfig.name,
                        moveConfig
                    )
                );
                getMovesFuncs.push(
                    generateGetLegalMovesFunction(pieceConfig.name, moveConfig)
                );
            }

            this._verifyFunctions.set(pieceConfig.name, verifyFuncs);
            this._getMovesFunctions.set(pieceConfig.name, getMovesFuncs);
        }
    }

    private generateVerifyBoardStateFunctions(): VerifyBoardStateFunction<PieceNames>[] {
        const verifyBoardFunctions: VerifyBoardStateFunction<PieceNames>[] = [];

        for (const condition of this._config.winConditions) {
            if (condition.condition === 'checkmate') {
                verifyBoardFunctions.push(
                    generateCheckFunction(condition.checkmatePiece)
                );
            }
        }

        return verifyBoardFunctions;
    }
}
