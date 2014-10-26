import {Dimension} from 'data/dimension';
import {DimensionValue} from 'data/dimensionValue';
import {Cell} from 'data/cell';
import {Grid} from 'data/grid';

export class GridFactory {

    buildFromJson(gridData) {
        let dimensions = new Map(),
            dimensionValuesByDimensions = new Map(),
            cells = [],

            dimensionPositions = new Map(),
            dimensionValuePositions = new Map()
        ;

        gridData.dimensions.forEach(function(dimension, index) {
            dimensions.set(dimension.id, new Dimension(dimension.id, dimension.caption));
            dimensionPositions.set(dimension.id, index);

            dimensionValuesByDimensions.set(dimension.id, new Map());
            dimensionValuePositions.set(dimension.id, new Map());
        });
        dimensionPositions.forEach(function(index, dimensionId) {
            gridData.dimensionValues[index].forEach(function(dimensionValue, dimensionValueIndex) {
                dimensionValuesByDimensions.get(dimensionId).set(dimensionValue.id, new DimensionValue(dimensionValue.id, dimensionValue.caption));
                dimensionValuePositions.get(dimensionId).set(dimensionValueIndex, dimensionValue.id);
            });
        });

        gridData.cells.forEach(function(cell) {
            let cellDimensionValues = new Map();

            dimensionPositions.forEach(function(index, dimensionId) {
                let dimensionValue = dimensionValuesByDimensions.get(dimensionId).get(dimensionValuePositions.get(dimensionId).get(cell.dimensionValues[index]));
                cellDimensionValues.set(dimensionId, dimensionValue);
            });

            cells.push(new Cell(cellDimensionValues, cell.value));
        });

        return new Grid(dimensions, dimensionValuesByDimensions, cells);
    }
}
