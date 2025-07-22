import { fileLetterToIndex, indexToFileLetter } from '../../common';
import {
    BoardPosition,
    Direction,
    InvalidSpaceError,
    PlayerColor,
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

    getSpaceRelativePosition<PieceNames extends string[]>(
        state: GameState<PieceNames>,
        position: BoardPosition,
        direction: Direction,
        numSpaces: number
    ): BoardSpaceStatus<PieceNames> {
        if (numSpaces <= 0) {
            throw new InvalidSpaceError('numSpaces must be at least 1');
        }

        const [fileIndex, rankIndex] =
            rectangularBoardHelper.coordinatesToIndicies(
                state.boardConfig,
                position
            );

        switch (direction) {
            case 'forward':
                return rectangularBoardHelper.getSpace(state, [
                    fileIndex,
                    rankIndex + numSpaces
                ]);
            case 'backward':
                return rectangularBoardHelper.getSpace(state, [
                    fileIndex,
                    rankIndex - numSpaces
                ]);
            case 'left':
                return rectangularBoardHelper.getSpace(state, [
                    fileIndex - numSpaces,
                    rankIndex
                ]);
            case 'right':
                return rectangularBoardHelper.getSpace(state, [
                    fileIndex + numSpaces,
                    rankIndex
                ]);
            case 'leftForward':
                return rectangularBoardHelper.getSpace(state, [
                    fileIndex - numSpaces,
                    rankIndex + numSpaces
                ]);
            case 'rightForward':
                return rectangularBoardHelper.getSpace(state, [
                    fileIndex + numSpaces,
                    rankIndex + numSpaces
                ]);
            case 'leftBackward':
                return rectangularBoardHelper.getSpace(state, [
                    fileIndex - numSpaces,
                    rankIndex - numSpaces
                ]);
            case 'rightBackward':
                return rectangularBoardHelper.getSpace(state, [
                    fileIndex + numSpaces,
                    rankIndex - numSpaces
                ]);
        }
    },

    getPieceSpaces<PieceNames extends string[]>(
        state: GameState<PieceNames>,
        {
            name,
            isColor,
            notColor
        }: {
            name?: PieceNames[keyof PieceNames];
            isColor?: PlayerColor;
            notColor?: PlayerColor;
        }
    ): BoardSpaceStatus<PieceNames>[] {
        const spaces: BoardSpaceStatus<PieceNames>[] = [];

        for (const space of boardSpaces(state)) {
            if (!space.piece) {
                continue;
            }

            const piece = space.piece;

            if (isColor && piece.color !== isColor) {
                continue;
            }

            if (notColor && piece.color === notColor) {
                continue;
            }

            if (name && piece.name !== name) {
                continue;
            }

            spaces.push(space);
        }

        return spaces;
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

function* boardSpaces<PieceNames extends string[]>(
    state: GameState<PieceNames>
) {
    for (let i = 0; i < state.boardConfig.width; i++) {
        for (let j = 0; j < state.boardConfig.height; j++) {
            yield state.board[i][j];
        }
    }
}
