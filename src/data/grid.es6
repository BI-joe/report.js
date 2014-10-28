import {Maps} from 'utils/maps';

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

                let currentDimension     = _.first(dimensions),
                    remainingDimensions    = _.without(dimensions, currentDimension);

                this.getDimensionValues(currentDimension).forEach(dimensionValue => {
                    let subCells = _.filter(cells, cell => cell.getDimensionValue(currentDimension) === dimensionValue);
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
}
