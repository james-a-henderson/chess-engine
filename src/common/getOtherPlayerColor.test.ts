import { getOtherPlayerColor } from './getOtherPlayerColor';

describe('getOtherPlayerColor', () => {
    test('returns black if input is white', () => {
        const result = getOtherPlayerColor('white');

        expect(result).toEqual('black');
    });

    test('returns white if input is black', () => {
        const result = getOtherPlayerColor('black');

        expect(result).toEqual('white');
    });
});
