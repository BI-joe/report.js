"use strict";
Object.defineProperties(exports, {
  Cell: {get: function() {
      return Cell;
    }},
  __esModule: {value: true}
});
var Cell = function Cell(dimensionValues, value) {
  this.dimensionValues = dimensionValues;
  this.value = value;
};
($traceurRuntime.createClass)(Cell, {getDimensionValue: function(dimension) {
    if (!this.dimensionValues.has(dimension.id)) {
      throw Error('The cell has no dimension value for the dimension "' + dimension.id + '"');
    }
    return this.dimensionValues.get(dimension.id);
  }}, {});
