import {
    BoardPosition,
    CastleConfigForColor,
    CastleMove,
    MoveConditionFunction,
    MoveOptions,
    verifyLegalMoveFunction
} from '../../../../types';
import { RectangularBoard } from '../../../board';
import { Piece } from '../../piece';
import {
    calculateMoveLength,
    determineMoveDirection,
    getMoveConditionFunctions,
    makeNextSpaceIterator,
    positionsAreEqual,
    validateCaptureRules
} from '../helpers';

export function generateVerifyCastleMoveFunctions<PieceNames extends string[]>(
    move: CastleMove<PieceNames>
): verifyLegalMoveFunction<PieceNames>[] {
    const conditionFunctions = getMoveConditionFunctions(
        move.moveConditions ?? []
    );

    return [generateFunction(move, conditionFunctions)];
}

function generateFunction<PieceNames extends string[]>(
    move: CastleMove<PieceNames>,
    conditionFunctions: MoveConditionFunction<PieceNames>[]
): verifyLegalMoveFunction<PieceNames> {
    return (
        board: RectangularBoard<PieceNames>,
        piece: Piece<PieceNames>,
        currentSpace: BoardPosition,
        destination: BoardPosition,
        moveOptions?: MoveOptions
    ) => {
        if (moveOptions?.type !== 'castle') {
            //we do this check becaue there are alternate chess rules (such as chess 960)
            //where a normal move and caslte move can have the same destination space
            return false;
        }

        const castleConfig = move.configForColor[piece.playerColor];

        if (!castleConfig) {
            return false; //castling not configured for this player color
        }

        if (!positionsAreEqual(castleConfig.origin, currentSpace)) {
            //current space must be the configured origin location for this move
            return false;
        }

        if (!positionsAreEqual(castleConfig.destination, destination)) {
            //destination space must be the configured result location for this move
            return false;
        }

        if (
            !validateCaptureRules(
                piece,
                board,
                destination,
                move.captureAvailability
            )
        ) {
            //we ignore capture rules if the destination space contains the castle target piece
            if (
                !positionsAreEqual(castleConfig.targetPieceOrigin, destination)
            ) {
                //this is unlikely to come up, as capturing off of a castle move requires the following conditions to be met:
                // 1. capturing is allowed
                // 2. neither the castling piece nor the target piece (king and rook in standard chess) move through the destination space
                // That being said, since the goal of this is for generic configuration, capturing off of a castle has to be supported
                // The exact rules may change as I flesh things out. This is something sort of in flux
                return false;
            }
        }

        for (const conditionFunction of conditionFunctions) {
            if (!conditionFunction(piece, board)) {
                return false;
            }
        }

        if (!targetPieceValid(piece, board, castleConfig)) {
            return false;
        }

        const [currentFileIndex, currentRankIndex] =
            board.coordinatesToIndicies(currentSpace);
        const [destinationFileIndex, destinationRankIndex] =
            board.coordinatesToIndicies(destination);

        const [targetCurrentFileIndex, targetCurrentRankIndex] =
            board.coordinatesToIndicies(castleConfig.targetPieceOrigin);
        const [targetDestinationFileIndex, targetDestinationRankIndex] =
            board.coordinatesToIndicies(castleConfig.targetPieceDestination);

        const moveDirection = determineMoveDirection(
            currentFileIndex,
            currentRankIndex,
            destinationFileIndex,
            destinationRankIndex,
            piece.playerColor
        );
        const targetMoveDirection = determineMoveDirection(
            targetCurrentFileIndex,
            targetCurrentRankIndex,
            targetDestinationFileIndex,
            targetDestinationRankIndex,
            piece.playerColor
        );

        if (moveDirection === 'invalid' || targetMoveDirection === 'invalid') {
            //both castling pieces must move in straight line
            //todo: verify this upon rules initialization
            return false;
        }

        const moveLength = calculateMoveLength(
            moveDirection,
            currentFileIndex,
            currentRankIndex,
            destinationFileIndex,
            destinationRankIndex
        );
        const targetMoveLength = calculateMoveLength(
            targetMoveDirection,
            targetCurrentFileIndex,
            targetCurrentRankIndex,
            targetDestinationFileIndex,
            targetDestinationRankIndex
        );

        for (const space of makeNextSpaceIterator(
            moveDirection,
            currentFileIndex,
            currentRankIndex,
            moveLength - 1, //no need to calculate final destination space, as the validateCaptureRules call handles that
            piece.playerColor
        )) {
            if (board.getSpace(space).piece !== undefined) {
                return false;
            }
        }

        //the target piece's destination space must be empty before move *unless* it's occupied by the castling piece
        if (
            !positionsAreEqual(
                castleConfig.targetPieceDestination,
                castleConfig.origin
            )
        ) {
            const targetDestinationSpace = board.getSpace(
                castleConfig.targetPieceDestination
            );
            if (targetDestinationSpace.piece) {
                return false;
            }
        }

        for (const space of makeNextSpaceIterator(
            targetMoveDirection,
            targetCurrentFileIndex,
            targetCurrentRankIndex,
            targetMoveLength - 1, //no need to calculate final destination space, as we check that above
            piece.playerColor
        )) {
            if (board.getSpace(space).piece !== undefined) {
                return false;
            }
        }

        if (
            !board.verifyMultipleMovePosition([
                {
                    originPosition: currentSpace,
                    destinationPosition: destination
                },
                {
                    originPosition: castleConfig.targetPieceOrigin,
                    destinationPosition: castleConfig.targetPieceDestination
                }
            ])
        ) {
            return false;
        }

        return {
            moveName: move.name,
            type: 'castle',
            pieceName: piece.pieceName,
            pieceColor: piece.playerColor,
            originSpace: currentSpace,
            destinationSpace: destination,
            castleTarget: {
                pieceName: castleConfig.targetPieceName,
                originSpace: castleConfig.targetPieceOrigin,
                destinationSpace: castleConfig.targetPieceDestination
            }
        };
    };
}

function targetPieceValid<PieceNames extends string[]>(
    piece: Piece<PieceNames>,
    board: RectangularBoard<PieceNames>,
    castleConfig: CastleConfigForColor<PieceNames>
): boolean {
    const targetPieceSpace = board.getSpace(castleConfig.targetPieceOrigin);
    if (
        !targetPieceSpace.piece ||
        targetPieceSpace.piece.playerColor !== piece.playerColor ||
        targetPieceSpace.piece.pieceName !== castleConfig.targetPieceName
    ) {
        return false;
    }

    return true;
}
