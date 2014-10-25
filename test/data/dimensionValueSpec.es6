import {DimensionValue} from 'data/dimensionValue';

describe('DimensionValue', function() {
    it('constructor', function() {
        let dimensionValue = new DimensionValue('myId');
        expect(dimensionValue.id).toBe('myId');
        expect(dimensionValue.caption).toBe('myId');

        dimensionValue = new DimensionValue('myId', 'myCaption');
        expect(dimensionValue.id).toBe('myId');
        expect(dimensionValue.caption).toBe('myCaption');
    });
});
