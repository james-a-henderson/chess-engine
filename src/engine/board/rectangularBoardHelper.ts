import { fileLetterToIndex, indexToFileLetter } from '../../common';
import {
    BoardPosition,
    InvalidSpaceError,
    RectangularBoardConfig
} from '../../types';
import { BoardSpaceStatus, GameState } from '../gameState';

export const rectangularBoardHelper = {
    getSpace<PieceNames extends string[]>(
        state: GameState<PieceNames>,
        position: BoardPosition | [number, number]
    ): BoardSpaceStatus<PieceNames> {
        let fileIndex: number;
        let rankIndex: number;

        if (typeof position[0] === 'string') {
            [fileIndex, rankIndex] =
                rectangularBoardHelper.coordinatesToIndicies(
                    state.boardConfig,
                    [position[0], position[1]]
                );
        } else {
            [fileIndex, rankIndex] = position;
        }

        assertValidIndicies(state.boardConfig, [fileIndex, rankIndex]);

        return state.board[fileIndex][rankIndex];
    },

    indiciesToCoordinates(
        boardConfig: RectangularBoardConfig,
        indicies: [number, number]
    ): BoardPosition {
        assertValidIndicies(boardConfig, indicies);
        return [indexToFileLetter(indicies[0]), indicies[1] + 1];
    },

    coordinatesToIndicies(
        boardConfig: RectangularBoardConfig,
        coordinates: BoardPosition
    ): [number, number] {
        assertValidCoordinates(boardConfig, coordinates);

        const fileIndex = fileLetterToIndex(coordinates[0]);
        const rankIndex = coordinates[1] - 1;

        return [fileIndex, rankIndex];
    }
};

function assertValidIndicies(
    boardConfig: RectangularBoardConfig,
    indicies: [number, number]
) {
    if (
        indicies[0] >= boardConfig.width ||
        indicies[1] >= boardConfig.height ||
        indicies[0] < 0 ||
        indicies[1] < 0 ||
        !Number.isInteger(indicies[0]) ||
        !Number.isInteger(indicies[1])
    ) {
        throw new InvalidSpaceError('Invalid space index');
    }
}

function assertValidCoordinates(
    boardConfig: RectangularBoardConfig,
    coordinates: BoardPosition
) {
    const fileIndex = fileLetterToIndex(coordinates[0]);
    const rankIndex = coordinates[1] - 1;

    if (
        fileIndex >= boardConfig.width ||
        rankIndex >= boardConfig.height ||
        fileIndex < 0 ||
        rankIndex < 0
    ) {
        throw new InvalidSpaceError('Invalid coordinates');
    }
}
