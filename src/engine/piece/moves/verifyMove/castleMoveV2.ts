import {
    BoardPosition,
    CastleConfigForColor,
    CastleMove,
    MoveConditionFunctionV2,
    MoveOptions,
    MoveRecord,
    verifyLegalMoveFunctionV2
} from '../../../../types';
import { rectangularBoardHelper } from '../../../board';
import { GameState } from '../../../gameState';
import {
    calculateMoveLength,
    determineMoveDirection,
    getMoveConditionFunctionsV2,
    makeNextSpaceIterator,
    positionsAreEqual,
    validateCaputureRulesV2
} from '../helpers';

export function generateVerifyCastleMoveFunctionV2<PieceNames extends string[]>(
    pieceName: PieceNames[keyof PieceNames],
    move: CastleMove<PieceNames>
): verifyLegalMoveFunctionV2<PieceNames> {
    const conditionFunctions = getMoveConditionFunctionsV2(
        pieceName,
        move.moveConditions ?? []
    );

    return generateFunction(pieceName, move, conditionFunctions);
}

function generateFunction<PieceNames extends string[]>(
    pieceName: PieceNames[keyof PieceNames],
    move: CastleMove<PieceNames>,
    conditionFunctions: MoveConditionFunctionV2<PieceNames>[]
): verifyLegalMoveFunctionV2<PieceNames> {
    return (
        state: GameState<PieceNames>,
        origin: BoardPosition,
        destination: BoardPosition,
        previousMove?: MoveRecord<PieceNames>,
        moveOptions?: MoveOptions<PieceNames>
    ) => {
        if (moveOptions?.type !== 'castle') {
            //must pass in castle specific move options
            //this is necessary becasue some alternate chess rules (such as chess 960) can
            //have situations where a normal move and a castle move have the same destination
            return false;
        }

        const castleConfig = move.configForColor[state.currentPlayer];

        if (!castleConfig) {
            return false; //castling not configured for this player color
        }

        if (!positionsAreEqual(castleConfig.origin, origin)) {
            //current space must be the configured origin location for this move
            return false;
        }

        if (!positionsAreEqual(castleConfig.destination, destination)) {
            //destination space must be configured result location for this move
            return false;
        }

        if (
            !validateCaputureRulesV2(
                state,
                origin,
                destination,
                move.captureAvailability
            )
        ) {
            //we ignore capture rules if the destination space contains the castle target piece
            if (
                !positionsAreEqual(castleConfig.targetPieceOrigin, destination)
            ) {
                return false;
            }
        }

        for (const conditionFunction of conditionFunctions) {
            if (!conditionFunction(state, origin, previousMove)) {
                return false;
            }
        }

        if (!targetPieceValid(state, castleConfig)) {
            return false;
        }

        if (
            !checkSpacesClear(
                state,
                origin,
                destination,
                castleConfig.targetPieceOrigin
            ) ||
            !checkSpacesClear(
                state,
                castleConfig.targetPieceOrigin,
                castleConfig.targetPieceDestination,
                origin
            )
        ) {
            //there are invalid pieces in the way
            return false;
        }

        //todo: validate resulting board state is valid
        return {
            type: 'castle',
            moveName: move.name,
            pieceName: pieceName,
            pieceColor: state.currentPlayer,
            originSpace: origin,
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
    state: GameState<PieceNames>,
    castleConfig: CastleConfigForColor<PieceNames>
): boolean {
    const targetPieceSpace = rectangularBoardHelper.getSpace(
        state,
        castleConfig.targetPieceOrigin
    );

    if (
        !targetPieceSpace.piece ||
        targetPieceSpace.piece.color !== state.currentPlayer ||
        targetPieceSpace.piece.name !== castleConfig.targetPieceName
    ) {
        return false;
    }

    return true;
}

function checkSpacesClear<PieceNames extends string[]>(
    state: GameState<PieceNames>,
    origin: BoardPosition,
    destination: BoardPosition,
    ignoreSpace: BoardPosition
): boolean {
    const [originFileIndex, originRankIndex] =
        rectangularBoardHelper.coordinatesToIndicies(state.boardConfig, origin);
    const [destinationFileIndex, destinationRankIndex] =
        rectangularBoardHelper.coordinatesToIndicies(
            state.boardConfig,
            destination
        );

    const moveDirection = determineMoveDirection(
        originFileIndex,
        originRankIndex,
        destinationFileIndex,
        destinationRankIndex,
        state.currentPlayer
    );

    if (moveDirection === 'invalid') {
        //castling piece must move in straight line
        return false;
    }

    const moveLength = calculateMoveLength(
        moveDirection,
        originFileIndex,
        originRankIndex,
        destinationFileIndex,
        destinationRankIndex
    );

    for (const space of makeNextSpaceIterator(
        moveDirection,
        originFileIndex,
        originRankIndex,
        moveLength,
        state.currentPlayer
    )) {
        const position = rectangularBoardHelper.indiciesToCoordinates(
            state.boardConfig,
            space
        ); //todo: simplify funciton calls so we don't need to convert here
        if (
            rectangularBoardHelper.getSpace(state, space).piece !== undefined &&
            !positionsAreEqual(position, ignoreSpace)
        ) {
            return false;
        }
    }

    return true;
}
