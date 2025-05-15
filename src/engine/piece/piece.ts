import { PieceConfig } from '../../types/configuration';

export class Piece<PieceNames extends string[]> {
    private config: PieceConfig<PieceNames>;
    constructor(config: PieceConfig<PieceNames>) {
        this.config = config;
    }
}
