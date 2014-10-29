import {Colors} from 'utils/colors';

describe('Colors', function() {
    it('hexToRgb', function() {
        let colors = new Colors();
        expect(colors.hexToRgb('#663300')).toEqual({ r : 102, g : 51, b : 0 });
    });

    it('rgbToString', function() {
        let colors = new Colors();
        expect(colors.rgbToString({ r : 102, g : 51, b : 0 }, 0.2)).toEqual('rgba(102,51,0,0.2)');
    });
});
