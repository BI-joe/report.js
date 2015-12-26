import {Maps}           from '../utils/maps';
import {Dimension}      from '../data/dimension';
import {DimensionValue} from '../data/dimensionValue';
import {Cell}           from '../data/cell';

export class Grid {

    constructor(dimensions, dimensionValues, cells) {
        this.cells = cells;
        this.dimensions = dimensions;
        this.dimensionValues = dimensionValues;
    }

    getDimension(dimensionId) {
        if (!this.dimensions.has(dimensionId)) {
            throw Error('The grid has no dimension "' + dimensionId + '"');
        }

        return this.dimensions.get(dimensionId);
    }

    getDimensionValues(dimension) {
        if (!this.dimensionValues.has(dimension.id)) {
            throw Error('The grid has no dimension values for the dimension "' + dimension.id + '"');
        }

        return this.dimensionValues.get(dimension.id);
    }

    getDimenionValuesSets(dimensions) {
        let mapUtils = new Maps(),
            getSets = function(sets, dimensions, cells, set = new Map()) {
                if (dimensions.length === 0) {
                    sets.push(set);

                    return;
                }

                let currentDimension     = dimensions[0],
                    remainingDimensions    = dimensions.slice(1);

                this.getDimensionValues(currentDimension).forEach(dimensionValue => {
                    let subCells = cells.filter(cell => cell.getDimensionValue(currentDimension) === dimensionValue);
                    if (subCells.length) {
                        let currentSet = mapUtils.clone(set);
                        currentSet.set(currentDimension.id, dimensionValue);
                        getSets.call(this, sets, remainingDimensions, subCells, currentSet);
                    }
                }, this);
            };

        let sets = [];
        getSets.call(this, sets, dimensions, this.cells);

        return sets;
    }

    getCell(dimensionValues) {
        return this.cells.find(cell => {
            let found = true;
            dimensionValues.forEach((dimensionValue, dimensionId) => {
                if (dimensionValue.id !== cell.getDimensionValue(this.getDimension(dimensionId)).id) {
                    found = false;
                }
            }, this);

            return found;
        }, this);
    }

    mergeDimensions(dimensions, newDimensionId) {
        // New Dimensions
        let newDimension = new Dimension(newDimensionId, dimensions.map(dimension => dimension.caption).join(' - ')),
            newDimensions = new Map();
        this.dimensions.forEach(dimension => {
            if (dimensions.indexOf(dimension) === -1) {
                newDimensions.set(dimension.id, dimension);
            }
        });
        newDimensions.set(newDimensionId, newDimension);

        // New dimension Values
        let newDimensionValues = new Map();
        this.dimensionValues.forEach((dimensionValues, dimensionId) => {
            if (dimensions.find(dim => dim.id === dimensionId) === undefined) {
                newDimensionValues.set(dimensionId, dimensionValues);
            }
        });
        newDimensionValues.set(newDimensionId, new Map());

        // Cells
        let newCells = [];
        this.cells.forEach(cell => {
            let newCellDimensionValues = new Map(),
                dimensionValuesToMerge = [];
            cell.dimensionValues.forEach((dimensionValue, dimensionId) => {
                if (dimensions.find(dim => dim.id === dimensionId) === undefined) {
                    newCellDimensionValues.set(dimensionId, dimensionValue);
                } else {
                    dimensionValuesToMerge.push(dimensionValue);
                }
            });
            let newCellDimensionValue = new DimensionValue(
                dimensionValuesToMerge.map(dimensionValue => dimensionValue.id).join('-'),
                dimensionValuesToMerge.map(dimensionValue => dimensionValue.caption).join(' - ')
            );
            newCellDimensionValues.set(newDimensionId, newCellDimensionValue);
            newDimensionValues.get(newDimensionId).set(newCellDimensionValue.id, newCellDimensionValue);
            newCells.push(new Cell(newCellDimensionValues, cell.value));
        });

        return new Grid(newDimensions, newDimensionValues, newCells);
    }
}
