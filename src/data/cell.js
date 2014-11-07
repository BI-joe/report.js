export class Cell {

    constructor(dimensionValues, value) {
        this.dimensionValues = dimensionValues;
        this.value = value;
    }

    getDimensionValue(dimension) {
        if (!this.dimensionValues.has(dimension.id)) {
            throw Error('The cell has no dimension value for the dimension "' + dimension.id + '"');
        }

        return this.dimensionValues.get(dimension.id);
    }
}
