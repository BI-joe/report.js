import { hexToRgb, rgbToString } from '../../src/js/utils/colors';

describe('Colors', function() {
    it('hexToRgb', function() {
        expect(hexToRgb('#663300')).toEqual({ r : 102, g : 51, b : 0 });
    });

    it('rgbToString', function() {
        expect(rgbToString({ r : 102, g : 51, b : 0 }, 0.2)).toEqual('rgba(102,51,0,0.2)');
    });
});
