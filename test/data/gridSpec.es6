import {Dimension} from 'data/dimension';
import {DimensionValue} from 'data/dimensionValue';
import {Cell} from 'data/cell';
import {Grid} from 'data/grid';

describe('Cell', function() {
    it('constructor', function() {
        let dimension = new Dimension('d'),
            dimensionValue = new DimensionValue('dv'),
            cellDimensionValues = new Map(),
            dimensionValuesByDimensions = new Map(),
            dimensions = new Map();
        cellDimensionValues.set('d', dimensionValue);
        dimensionValuesByDimensions.set('d', [dimensionValue]);
        dimensions.set('d', dimension);
        let cell = new Cell(cellDimensionValues, 10),
            grid = new Grid(dimensions, dimensionValuesByDimensions, [cell]);

        expect(grid.dimensionValues).toBe(dimensionValuesByDimensions);
        expect(grid.dimensions).toEqual(dimensions);
        expect(grid.cells).toEqual([cell]);
    });

    it('getDimension', function() {
        let dimension = new Dimension('d'),
            dimensionValue = new DimensionValue('dv'),
            cellDimensionValues = new Map(),
            dimensionValuesByDimensions = new Map(),
            dimensions = new Map();
        cellDimensionValues.set('d', dimensionValue);
        dimensionValuesByDimensions.set('d', [dimensionValue]);
        dimensions.set('d', dimension);
        let cell = new Cell(cellDimensionValues, 10),
            grid = new Grid(dimensions, dimensionValuesByDimensions, [cell]);

        expect(grid.getDimension('d')).toBe(dimension);
    });

    it('getDimensionValues', function() {
        let dimension = new Dimension('d'),
            dimensionValue = new DimensionValue('dv'),
            cellDimensionValues = new Map(),
            dimensionValuesByDimensions = new Map(),
            dimensions = new Map();
        cellDimensionValues.set('d', dimensionValue);
        dimensionValuesByDimensions.set('d', [dimensionValue]);
        dimensions.set('d', dimension);
        let cell = new Cell(cellDimensionValues, 10),
            grid = new Grid(dimensions, dimensionValuesByDimensions, [cell]);

        expect(grid.getDimensionValues(dimension)).toEqual([dimensionValue]);
    });
});
