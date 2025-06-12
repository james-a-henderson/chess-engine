import {
    AvailableMoves,
    BoardPosition,
    CastleMove,
    GetLegalMovesFunction,
    RectangularBoardConfig,
    RulesConfigurationError
} from '../../../../types';
import { RectangularBoard } from '../../../board';
import { Piece } from '../../piece';
import { generateVerifyLegalMoveFunction } from '../verifyMove';

export function generateGetLegalCastleMovesFunction<
    PieceNames extends string[]
>(
    move: CastleMove<PieceNames>,
    boardConfig: RectangularBoardConfig
): GetLegalMovesFunction<PieceNames> {
    //since there's only one possible move for each castle move, we can lean on the verify move code
    const verifyCastleMoveFunction = generateVerifyLegalMoveFunction(
        move,
        boardConfig
    );

    return (
        board: RectangularBoard<PieceNames>,
        piece: Piece<PieceNames>,
        currentSpace: BoardPosition
    ) => {
        const availableMoves: AvailableMoves = {
            moves: [],
            captureMoves: [],
            spacesThreatened: [],
            specialMoves: []
        };
        const castleDestination =
            move.configForColor[piece.playerColor]?.destination;

        if (!castleDestination) {
            //todo: catch this during board setup
            throw new RulesConfigurationError(
                'Castle information not configured for player color'
            );
        }

        const verifyResult = verifyCastleMoveFunction(
            board,
            piece,
            currentSpace,
            castleDestination
        );

        if (!verifyResult) {
            return availableMoves;
        }

        availableMoves.specialMoves?.push({
            type: 'castle',
            destination: castleDestination
        });

        if (move.captureAvailability !== 'forbidden') {
            availableMoves.spacesThreatened.push(castleDestination);

            const destinationSpace = board.getSpace(castleDestination);
            if (destinationSpace.piece) {
                //todo: not sure how we want to differentiate this from normal capture move to that space
                availableMoves.captureMoves.push(castleDestination);
            }
        }

        return availableMoves;
    };
}
