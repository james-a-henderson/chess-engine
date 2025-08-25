import {
    BoardConfigurationError,
    MAXIMUM_BOARD_SIZE,
    PieceConfigurationError,
    PlayerColor,
    RectangularBoardConfig
} from '../../types';
import { rectangularBoardHelper } from '../board';
import {
    BoardSpace,
    GameState,
    PiecePlacement
} from '../../types/engine/gameState';

//todo: extend to other board shapes
export function generateGameState<PieceNames extends string[]>(
    piecePlacements: PiecePlacement<PieceNames>[],
    currentPlayer: PlayerColor,
    boardConfig: RectangularBoardConfig
): GameState<PieceNames> {
    const state: GameState<PieceNames> = {
        boardConfig: boardConfig,
        currentPlayer: currentPlayer,
        status: { status: 'inProgress' }, //I might make this configurable later
        board: generateEmptyBoard(boardConfig),
        capturedPieces: {
            white: [],
            black: []
        }
    };

    //place pieces
    for (const piecePlacement of piecePlacements) {
        const space = rectangularBoardHelper.getSpace(
            state,
            piecePlacement.position
        );

        if (space.piece) {
            throw new PieceConfigurationError(
                piecePlacement.piece.name,
                'Multiple pieces cannot be on the same space'
            );
        }

        space.piece = piecePlacement.piece;
    }

    return state;
}

function generateEmptyBoard<PieceNames extends string[]>(
    boardConfig: RectangularBoardConfig
): BoardSpace<PieceNames>[][] {
    if (
        !Number.isSafeInteger(boardConfig.width) ||
        !Number.isSafeInteger(boardConfig.height) ||
        boardConfig.width <= 0 ||
        boardConfig.width > MAXIMUM_BOARD_SIZE ||
        boardConfig.height <= 0 ||
        boardConfig.height > MAXIMUM_BOARD_SIZE
    ) {
        throw new BoardConfigurationError('invalid board size');
    }

    const board: BoardSpace<PieceNames>[][] = [];

    for (let i = 0; i < boardConfig.width; i++) {
        const file: BoardSpace<PieceNames>[] = [];
        for (let j = 0; j < boardConfig.height; j++) {
            file.push({
                position: rectangularBoardHelper.indiciesToCoordinates(
                    boardConfig,
                    [i, j]
                ),
                piece: undefined
            });
        }
        board.push(file);
    }

    return board;
}
