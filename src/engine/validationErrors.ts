export class RulesConfigurationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'RulesConfigurationError';
        Object.setPrototypeOf(this, RulesConfigurationError.prototype);
    }
}

export class BoardConfigurationError extends RulesConfigurationError {
    constructor(message: string) {
        super(message);
        this.name = 'BoardConfigurationError';
        Object.setPrototypeOf(this, BoardConfigurationError.prototype);
    }
}

export class PlayerConfigurationError extends RulesConfigurationError {
    constructor(message: string) {
        super(message);
        this.name = 'PlayerConfigurationError';
        Object.setPrototypeOf(this, PlayerConfigurationError.prototype);
    }
}

export class PieceConfigurationError extends RulesConfigurationError {
    constructor(pieceName: string, message: string) {
        const formattedMessage = `Piece ${pieceName} has configuration error: ${message}`;
        super(formattedMessage);
        this.name = 'PieceConfigurationError';
        Object.setPrototypeOf(this, PieceConfigurationError.prototype);
    }
}
