import {Dimension} from '../../src/js/data/dimension';
import {DimensionValue} from '../../src/js/data/dimensionValue';
import {Cell} from '../../src/js/data/cell';

describe('Cell', function() {
    it('constructor', function() {
        let dimensionValue = new DimensionValue('dv'),
            dimensionValues = new Map();
        dimensionValues.set('d', dimensionValue);
        let cell = new Cell(dimensionValues, 10);

        expect(cell.dimensionValues).toBe(dimensionValues);
        expect(cell.value).toBe(10);
    });

    it('getter dimension value', function() {
        let dimension = new Dimension('d'),
            dimensionValue = new DimensionValue('dv'),
            dimensionValues = new Map();
        dimensionValues.set('d', dimensionValue);
        let cell = new Cell(dimensionValues, 10);

        expect(cell.getDimensionValue(dimension)).toBe(dimensionValue);
    });
});
