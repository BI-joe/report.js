import {Dimension} from '../../src/data/dimension';
import {DimensionValue} from '../../src/data/dimensionValue';
import {Cell} from '../../src/data/cell';
import {Grid} from '../../src/data/grid';

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

    it('getCell', function() {
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

        expect(grid.getCell(cellDimensionValues)).toBe(cell);
    });

    it('getSets', function() {
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

        expect(grid.getDimenionValuesSets([dimension])).toEqual([cellDimensionValues]);
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

    it('mergeDimensions', function() {
        let grid, expectedGrid, dimension2, dimension3;

        {
            dimension2 = new Dimension('d2');
            dimension3 = new Dimension('d3');
            let dimension = new Dimension('d'),
                dimensionValue = new DimensionValue('d11'),
                dimensionValue2 = new DimensionValue('d21'),
                dimensionValue3 = new DimensionValue('d31'),
                dimensionValue4 = new DimensionValue('d12'),
                dimensionValue5 = new DimensionValue('d22'),
                dimensionValue6 = new DimensionValue('d32'),
                cellDimensionValues = new Map(),
                cellDimensionValues2 = new Map(),
                dimensionValuesByDimensions = new Map(),
                dimensions = new Map();
            cellDimensionValues.set('d', dimensionValue);
            cellDimensionValues.set('d2', dimensionValue2);
            cellDimensionValues.set('d3', dimensionValue3);
            cellDimensionValues2.set('d', dimensionValue4);
            cellDimensionValues2.set('d2', dimensionValue5);
            cellDimensionValues2.set('d3', dimensionValue6);
            dimensionValuesByDimensions.set('d', new Map());
            dimensionValuesByDimensions.set('d2', new Map());
            dimensionValuesByDimensions.set('d3', new Map());
            dimensionValuesByDimensions.get('d').set('d11', dimensionValue);
            dimensionValuesByDimensions.get('d').set('d12', dimensionValue4);
            dimensionValuesByDimensions.get('d2').set('d21', dimensionValue2);
            dimensionValuesByDimensions.get('d2').set('d22', dimensionValue5);
            dimensionValuesByDimensions.get('d3').set('d31', dimensionValue3);
            dimensionValuesByDimensions.get('d3').set('d32', dimensionValue6);
            dimensions.set('d', dimension);
            dimensions.set('d2', dimension2);
            dimensions.set('d3', dimension3);
            let cell = new Cell(cellDimensionValues, 10),
                cell2 = new Cell(cellDimensionValues2, 20);
            grid = new Grid(dimensions, dimensionValuesByDimensions, [cell, cell2]);
        }

        {
            let dimension = new Dimension('d'),
                dimension2 = new Dimension('newd'),
                dimensionValue = new DimensionValue('d11'),
                dimensionValue2 = new DimensionValue('d21-d31', 'd21 - d31'),
                dimensionValue3 = new DimensionValue('d12'),
                dimensionValue4 = new DimensionValue('d22-d32', 'd22 - d32'),
                cellDimensionValues = new Map(),
                cellDimensionValues2 = new Map(),
                dimensionValuesByDimensions = new Map(),
                dimensions = new Map();
            cellDimensionValues.set('d', dimensionValue);
            cellDimensionValues.set('newd', dimensionValue2);
            cellDimensionValues2.set('d', dimensionValue3);
            cellDimensionValues2.set('newd', dimensionValue4);
            dimensionValuesByDimensions.set('d', new Map());
            dimensionValuesByDimensions.set('newd', new Map());
            dimensionValuesByDimensions.get('d').set('d11', dimensionValue);
            dimensionValuesByDimensions.get('d').set('d12', dimensionValue3);
            dimensionValuesByDimensions.get('newd').set('d21-d31', dimensionValue2);
            dimensionValuesByDimensions.get('newd').set('d22-d32', dimensionValue4);
            dimensions.set('d', dimension);
            dimensions.set('newd', dimension2);
            let cell = new Cell(cellDimensionValues, 10),
                cell2 = new Cell(cellDimensionValues2, 20);
            expectedGrid = new Grid(dimensions, dimensionValuesByDimensions, [cell, cell2]);
        }

        expect(grid.mergeDimensions([dimension2, dimension3], 'newd')).toEqual(expectedGrid);
    });
});
