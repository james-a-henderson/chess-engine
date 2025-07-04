import { fileLetterToIndex, indexToFileLetter } from '../../common';
import {
    BoardConfigurationError,
    BoardPosition,
    BoardSpace,
    Direction,
    IllegalMoveError,
    InvalidSpaceError,
    MAXIMUM_BOARD_SIZE,
    PieceConfigurationError,
    PiecePlacement,
    PlayerColor,
    RectangularBoardConfig,
    VerifyBoardStateFunction
} from '../../types';

//todo: implement as interface to enable other board shapes
//      The current piece code assumes a rectangular board right now, so this is not currently possible
export class RectangularBoard<PieceNames extends string[]> {
    private _config: RectangularBoardConfig;
    private _spaces: BoardSpace<PieceNames>[][];
    private _verifyBoardStateFunctions: VerifyBoardStateFunction<PieceNames>[];

    constructor(
        config: RectangularBoardConfig,
        piecePlacements: PiecePlacement<PieceNames>[],
        verifyBoardStateFunctions: VerifyBoardStateFunction<PieceNames>[] = []
    ) {
        this._config = config;
        this._spaces = this.generateEmptyBoard();
        this.placePieces(piecePlacements);

        this._verifyBoardStateFunctions = verifyBoardStateFunctions;
    }

    get spaces() {
        return this._spaces;
    }

    get height() {
        return this._config.height;
    }

    get width() {
        return this._config.width;
    }

    public getSpace(
        position: BoardPosition | [number, number]
    ): BoardSpace<PieceNames> {
        let fileIndex: number;
        let rankIndex: number;

        if (typeof position[0] === 'string') {
            [fileIndex, rankIndex] = this.coordinatesToIndicies(
                [position[0], position[1]] //typescript compiler doesn't seem to know position is a BoardPosition here without splitting up the array
            );
        } else {
            [fileIndex, rankIndex] = position;
        }

        this.assertValidIndicies([fileIndex, rankIndex]);

        return this._spaces[fileIndex][rankIndex];
    }

    public getSpaceRelativePosition(
        position: BoardPosition,
        direction: Direction,
        numSpaces: number
    ): BoardSpace<PieceNames> {
        if (numSpaces <= 0) {
            throw new InvalidSpaceError('numSpaces must be at least 1');
        }

        const [fileIndex, rankIndex] = this.coordinatesToIndicies(position);
        switch (direction) {
            case 'forward':
                return this.getSpace([fileIndex, rankIndex + numSpaces]);
            case 'backward':
                return this.getSpace([fileIndex, rankIndex - numSpaces]);
            case 'left':
                return this.getSpace([fileIndex - numSpaces, rankIndex]);
            case 'right':
                return this.getSpace([fileIndex + numSpaces, rankIndex]);
            case 'leftForward':
                return this.getSpace([
                    fileIndex - numSpaces,
                    rankIndex + numSpaces
                ]);
            case 'rightForward':
                return this.getSpace([
                    fileIndex + numSpaces,
                    rankIndex + numSpaces
                ]);
            case 'leftBackward':
                return this.getSpace([
                    fileIndex - numSpaces,
                    rankIndex - numSpaces
                ]);
            case 'rightBackward':
                return this.getSpace([
                    fileIndex + numSpaces,
                    rankIndex - numSpaces
                ]);
        }
    }

    public getPieceSpaces({
        name,
        isColor,
        notColor
    }: {
        name?: PieceNames[keyof PieceNames];
        isColor?: PlayerColor;
        notColor?: PlayerColor;
    }): BoardSpace<PieceNames>[] {
        const spaces: BoardSpace<PieceNames>[] = [];

        for (const space of this.boardSpaces()) {
            if (!space.piece) {
                continue;
            }

            const piece = space.piece;

            if (isColor && piece.playerColor !== isColor) {
                continue;
            }

            if (notColor && piece.playerColor === notColor) {
                continue;
            }

            if (name && piece.pieceName !== name) {
                continue;
            }

            spaces.push(space);
        }

        return spaces;
    }

    /**
     * Moves a piece. If another piece is on the destinationPosition, that piece will
     * be removed.
     *
     * Note that this function does *not* check if this move is valid. It also will not iterate a piece's internal move count.
     * Those functions must be handled by other code
     *
     * @param originPosition
     * @param destinationPosition
     */
    public movePiece(
        originPosition: BoardPosition,
        destinationPosition: BoardPosition
    ): void {
        this.movePieces([
            {
                originPosition: originPosition,
                destinationPosition: destinationPosition
            }
        ]);
    }

    public movePieces(
        moves: {
            originPosition: BoardPosition;
            destinationPosition: BoardPosition;
        }[]
    ) {
        const placements: PiecePlacement<PieceNames>[] = [];
        const origins: Set<string> = new Set();
        const destinations: Set<string> = new Set();

        //get all pieces on specified spaces, and remove them from original space
        for (const move of moves) {
            const originString =
                move.originPosition[0] + move.originPosition[1];
            if (origins.has(originString)) {
                throw new IllegalMoveError(
                    'Cannot move same piece multiple times'
                );
            }
            origins.add(originString);

            const destinationString =
                move.destinationPosition[0] + move.destinationPosition[1];
            if (destinations.has(destinationString)) {
                throw new IllegalMoveError(
                    'Cannot move multiple pieces to same destination'
                );
            }
            destinations.add(destinationString);

            const originSpace = this.getSpace(move.originPosition);
            if (!originSpace.piece) {
                throw new IllegalMoveError('Must have piece on origin space');
            }

            placements.push({
                piece: originSpace.piece,
                position: move.destinationPosition
            });

            originSpace.piece = undefined;
        }

        //place pieces on destination space
        for (const placement of placements) {
            const destinationSpace = this.getSpace(placement.position);
            destinationSpace.piece = placement.piece;
        }
    }

    private generateEmptyBoard(): BoardSpace<PieceNames>[][] {
        if (
            !Number.isSafeInteger(this.width) ||
            !Number.isSafeInteger(this.height) ||
            this.width <= 0 ||
            this.width > MAXIMUM_BOARD_SIZE ||
            this.height <= 0 ||
            this.height > MAXIMUM_BOARD_SIZE
        ) {
            throw new BoardConfigurationError('invalid board size');
        }

        const board: BoardSpace<PieceNames>[][] = [];

        for (let i = 0; i < this.width; i++) {
            const file: BoardSpace<PieceNames>[] = [];
            for (let j = 0; j < this.height; j++) {
                file.push({
                    position: this.indiciesToCoordinates([i, j]),
                    piece: undefined
                });
            }
            board.push(file);
        }

        return board;
    }

    public verifyMovePositionValid(
        originPosition: BoardPosition,
        destinationPosition: BoardPosition
    ): boolean {
        return this.verifyMultipleMovePosition([
            {
                originPosition: originPosition,
                destinationPosition: destinationPosition
            }
        ]);
    }

    public verifyMultipleMovePosition(
        moves: {
            originPosition: BoardPosition;
            destinationPosition: BoardPosition;
        }[]
    ): boolean {
        if (this._verifyBoardStateFunctions.length === 0) {
            //return true if no verifyBoardState functions (as we have nothing to check)
            return true;
        }

        if (moves.length === 0) {
            throw new IllegalMoveError('Must move at least one piece');
        }

        const movedPieceColor = this.getSpace(moves[0].originPosition).piece
            ?.playerColor;

        for (const move of moves) {
            const space = this.getSpace(move.originPosition);
            if (space.piece?.playerColor !== movedPieceColor) {
                throw new IllegalMoveError(
                    'Cannot move pieces of different colors at same time'
                );
            }
        }

        const validationBoard = this.duplicateBoard();

        validationBoard.movePieces(moves);

        if (!movedPieceColor) {
            //this error is highly unlikely, as it would require the movePiece function to fail silently
            throw new Error('Unable to determine color of moved piece');
        }

        for (const func of this._verifyBoardStateFunctions) {
            if (!func(validationBoard, movedPieceColor)) {
                return false;
            }
        }

        return true;
    }

    private duplicateBoard(): RectangularBoard<PieceNames> {
        const piecePlacements: PiecePlacement<PieceNames>[] = [];

        for (const space of this.boardSpaces()) {
            if (!space.piece) {
                continue;
            }

            piecePlacements.push({
                piece: space.piece,
                position: space.position
            });
        }

        return new RectangularBoard(this._config, piecePlacements);
    }

    private *boardSpaces() {
        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                yield this._spaces[i][j];
            }
        }
    }

    private placePieces(piecePlacements: PiecePlacement<PieceNames>[]): void {
        for (const piecePlacement of piecePlacements) {
            const space = this.getSpace(piecePlacement.position);

            if (space.piece) {
                throw new PieceConfigurationError(
                    piecePlacement.piece.pieceName,
                    'Multiple pieces cannot be on the same space'
                );
            }

            space.piece = piecePlacement.piece;
        }
    }

    /**
     * Translates two dimensional array indicies to chess coordinates
     *
     * For example, [0][4] would translate to a5
     * @param indicies
     */
    public indiciesToCoordinates(indicies: [number, number]): BoardPosition {
        this.assertValidIndicies(indicies);
        return [indexToFileLetter(indicies[0]), indicies[1] + 1];
    }

    public coordinatesToIndicies(coordinates: BoardPosition): [number, number] {
        this.assertValidCoordinates(coordinates);

        const fileIndex = fileLetterToIndex(coordinates[0]);
        const rankIndex = coordinates[1] - 1;

        return [fileIndex, rankIndex];
    }

    private assertValidIndicies(indicies: [number, number]) {
        if (
            indicies[0] >= this.width ||
            indicies[1] >= this.height ||
            indicies[0] < 0 ||
            indicies[1] < 0 ||
            !Number.isInteger(indicies[0]) ||
            !Number.isInteger(indicies[1])
        ) {
            throw new InvalidSpaceError('Invalid space index');
        }
    }

    private assertValidCoordinates(coordinates: BoardPosition) {
        const fileIndex = fileLetterToIndex(coordinates[0]);
        const rankIndex = coordinates[1] - 1;

        if (
            fileIndex >= this.width ||
            rankIndex >= this.height ||
            fileIndex < 0 ||
            rankIndex < 0
        ) {
            throw new InvalidSpaceError('Invalid coordinates');
        }
    }
}
