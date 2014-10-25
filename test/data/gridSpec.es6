import {Dimension} from 'data/dimension';
import {DimensionValue} from 'data/dimensionValue';
import {Cell} from 'data/cell';
import {Grid} from 'data/grid';

describe('Cell', function() {
    it('constructor', function() {
        let dimension = new Dimension('d'),
            dimensionValue = new DimensionValue('dv'),
            cellDimensionValues = new Map(),
            dimensionValuesByDimensions = new Map();
        cellDimensionValues.set('d', dimensionValue);
        dimensionValuesByDimensions.set('d', [dimensionValue]);
        let cell = new Cell(cellDimensionValues, 10),
            grid = new Grid([dimension], dimensionValuesByDimensions, [cell]);

        expect(grid.dimensionValues).toBe(dimensionValuesByDimensions);
        expect(grid.dimensions).toEqual([dimension]);
        expect(grid.cells).toEqual([cell]);
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
