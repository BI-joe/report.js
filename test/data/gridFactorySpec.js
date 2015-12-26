import {GridFactory} from '../../src/js/data/gridFactory';
import {Dimension} from '../../src/js/data/dimension';
import {DimensionValue} from '../../src/js/data/dimensionValue';
import {Cell} from '../../src/js/data/cell';
import {Grid} from '../../src/js/data/grid';


describe('GridFactory', function() {
    it('buildFromJson', function() {
        let
            factory = new GridFactory(),

            dimension = new Dimension('d'),
            dimension2 = new Dimension('d2'),
            dimensionValue = new DimensionValue('d11'),
            dimensionValue2 = new DimensionValue('d21'),
            dimensionValue3 = new DimensionValue('d12'),
            dimensionValue4 = new DimensionValue('d22'),
            cellDimensionValues = new Map(),
            cellDimensionValues2 = new Map(),
            dimensionValuesByDimensions = new Map(),
            dimensions = new Map(),
            dimension1map = new Map(),
            dimension2map = new Map();
        cellDimensionValues.set('d', dimensionValue);
        cellDimensionValues.set('d2', dimensionValue2);
        cellDimensionValues2.set('d', dimensionValue3);
        cellDimensionValues2.set('d2', dimensionValue4);
        dimension1map.set('d11', dimensionValue);
        dimension1map.set('d12', dimensionValue3);
        dimension2map.set('d21', dimensionValue2);
        dimension2map.set('d22', dimensionValue4);
        dimensionValuesByDimensions.set('d', dimension1map);
        dimensionValuesByDimensions.set('d2', dimension2map);
        dimensions.set('d', dimension);
        dimensions.set('d2', dimension2);
        let cell = new Cell(cellDimensionValues, 10),
            cell2 = new Cell(cellDimensionValues2, 5),
            expectedGrid = new Grid(dimensions, dimensionValuesByDimensions, [cell, cell2]);

        let gridData = {
            dimensions: [{ id: 'd'}, { id: 'd2' }],
            dimensionValues: [
                [{ id: 'd11' }, { id: 'd12' }],
                [{ id: 'd21' }, { id: 'd22' }]
            ],
            cells: [
                {value: 10, dimensionValues: [0, 0]},
                {value: 5, dimensionValues: [1, 1]}
            ]
        };

        expect(factory.buildFromJson(gridData)).toEqual(expectedGrid);
    });
});
