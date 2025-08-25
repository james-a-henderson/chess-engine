import { PlayerColor } from '../types';
import { assertUnreachable } from './assertUnreachable';

//currently only two players are supported. This will need to be updated if support for more players is added
export function getOtherPlayerColor(color: PlayerColor): PlayerColor {
    switch (color) {
        case 'white':
            return 'black';
        case 'black':
            return 'white';
        default:
            assertUnreachable(color);
    }
}
