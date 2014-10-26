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
}
