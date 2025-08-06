import {
    GameError,
    LegalMovesForPiece,
    PlayerColor,
    VerifyMovesForPiece
} from '../../../types';
import { GameState } from '../../gameState';
import { rectangularBoardHelper } from '../rectangularBoardHelper';

export function pieceIsInCheckV2<PieceNames extends string[]>(
    gameState: GameState<PieceNames>,
    verifyFunctions: VerifyMovesForPiece<PieceNames>,
    getMovesFunctions: LegalMovesForPiece<PieceNames>,
    pieceName: PieceNames[keyof PieceNames],
    pieceColor: PlayerColor
): boolean {
    const checkPieceSpaceResult = rectangularBoardHelper.getPieceSpaces(
        gameState,
        {
            name: pieceName,
            isColor: pieceColor
        }
    );

    if (checkPieceSpaceResult.length !== 1) {
        throw new GameError(
            `Expected exactly check piece, but found ${checkPieceSpaceResult.length}`
        );
    }

    const checkPiecePosition = checkPieceSpaceResult[0].position;

    const otherPieceSpaces = rectangularBoardHelper.getPieceSpaces(gameState, {
        notColor: pieceColor
    });

    for (const space of otherPieceSpaces) {
        const pieceVerifyFuncs = verifyFunctions.get(space.piece!.name);

        if (!pieceVerifyFuncs || pieceVerifyFuncs.length === 0) {
            continue;
        }

        for (const func of pieceVerifyFuncs) {
            if (
                func(
                    gameState,
                    space.position,
                    checkPiecePosition,
                    getMovesFunctions
                )
            ) {
                //at least one piece can capture the check piece
                return true;
            }
        }
    }

    return false;
}
