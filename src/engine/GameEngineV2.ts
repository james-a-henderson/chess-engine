import {
    GameError,
    GameRules,
    GetLegalMovesFunctionV2,
    LegalMovesForPiece,
    PieceConfig,
    PieceConfigurationError,
    Player,
    PlayerColor,
    PlayerConfigurationError,
    VerifyBoardStateFunctionV2,
    verifyLegalMoveFunctionV2,
    VerifyMovesForPiece
} from '../types';
import { generateCheckFunctionV2 } from './board';
import {
    BoardSpaceStatus,
    GameState,
    GameStatePiecePlacement
} from './gameState';
import { generateGameState } from './gameState/generateGameState';
import {
    generateGetLegalMovesFunctionV2,
    generateVerifyLegalMoveFunctionV2
} from './piece/moves';

export class GameEngineV2<PieceNames extends string[]> {
    private _players: Player[];
    private _gameStates: GameState<PieceNames>[];
    private _config: GameRules<PieceNames>;

    private _verifyFunctions: VerifyMovesForPiece<PieceNames> = new Map();
    private _getMovesFunctions: LegalMovesForPiece<PieceNames> = new Map();

    private _verifyBoardFunctions: VerifyBoardStateFunctionV2<PieceNames>[];

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

    get currentBoard(): BoardSpaceStatus<PieceNames>[][] {
        return this.currentGameState.board;
    }

    private generateInitialGameState(): GameState<PieceNames> {
        const placements: GameStatePiecePlacement<PieceNames>[] = [];

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
            const verifyFuncs: verifyLegalMoveFunctionV2<PieceNames>[] = [];
            const getMovesFuncs: GetLegalMovesFunctionV2<PieceNames>[] = [];

            for (const moveConfig of pieceConfig.moves) {
                verifyFuncs.push(
                    generateVerifyLegalMoveFunctionV2(
                        pieceConfig.name,
                        moveConfig
                    )
                );
                getMovesFuncs.push(
                    generateGetLegalMovesFunctionV2(
                        pieceConfig.name,
                        moveConfig
                    )
                );
            }

            this._verifyFunctions.set(pieceConfig.name, verifyFuncs);
            this._getMovesFunctions.set(pieceConfig.name, getMovesFuncs);
        }
    }

    private generateVerifyBoardStateFunctions(): VerifyBoardStateFunctionV2<PieceNames>[] {
        const verifyBoardFunctions: VerifyBoardStateFunctionV2<PieceNames>[] =
            [];

        for (const condition of this._config.winConditions) {
            if (condition.condition === 'checkmate') {
                verifyBoardFunctions.push(
                    generateCheckFunctionV2(condition.checkmatePiece)
                );
            }
        }

        return verifyBoardFunctions;
    }
}
