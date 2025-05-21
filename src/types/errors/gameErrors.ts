export class GameError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'GameError';
        Object.setPrototypeOf(this, GameError.prototype);
    }
}

export class InvalidSpaceError extends GameError {
    constructor(message: string) {
        super(message);
        this.name = 'InvalidSpaceError';
        Object.setPrototypeOf(this, InvalidSpaceError.prototype);
    }
}

export class IllegalMoveError extends GameError {
    constructor(message: string) {
        super(message);
        this.name = 'InvalidMoveError';
        Object.setPrototypeOf(this, IllegalMoveError.prototype);
    }
}
