"use strict";
Object.defineProperties(exports, {
  GridFactory: {get: function() {
      return GridFactory;
    }},
  __esModule: {value: true}
});
var $___46__46__47_data_47_dimension__,
    $___46__46__47_data_47_dimensionValue__,
    $___46__46__47_data_47_cell__,
    $___46__46__47_data_47_grid__;
var Dimension = ($___46__46__47_data_47_dimension__ = require("../data/dimension"), $___46__46__47_data_47_dimension__ && $___46__46__47_data_47_dimension__.__esModule && $___46__46__47_data_47_dimension__ || {default: $___46__46__47_data_47_dimension__}).Dimension;
var DimensionValue = ($___46__46__47_data_47_dimensionValue__ = require("../data/dimensionValue"), $___46__46__47_data_47_dimensionValue__ && $___46__46__47_data_47_dimensionValue__.__esModule && $___46__46__47_data_47_dimensionValue__ || {default: $___46__46__47_data_47_dimensionValue__}).DimensionValue;
var Cell = ($___46__46__47_data_47_cell__ = require("../data/cell"), $___46__46__47_data_47_cell__ && $___46__46__47_data_47_cell__.__esModule && $___46__46__47_data_47_cell__ || {default: $___46__46__47_data_47_cell__}).Cell;
var Grid = ($___46__46__47_data_47_grid__ = require("../data/grid"), $___46__46__47_data_47_grid__ && $___46__46__47_data_47_grid__.__esModule && $___46__46__47_data_47_grid__ || {default: $___46__46__47_data_47_grid__}).Grid;
var GridFactory = function GridFactory() {};
($traceurRuntime.createClass)(GridFactory, {buildFromJson: function(gridData) {
    var dimensions = new Map(),
        dimensionValuesByDimensions = new Map(),
        cells = [],
        dimensionPositions = new Map(),
        dimensionValuePositions = new Map();
    ;
    gridData.dimensions.forEach((function(dimension, index) {
      dimensions.set(dimension.id, new Dimension(dimension.id, dimension.caption));
      dimensionPositions.set(dimension.id, index);
      dimensionValuesByDimensions.set(dimension.id, new Map());
      dimensionValuePositions.set(dimension.id, new Map());
    }));
    dimensionPositions.forEach((function(index, dimensionId) {
      gridData.dimensionValues[index].forEach((function(dimensionValue, dimensionValueIndex) {
        dimensionValuesByDimensions.get(dimensionId).set(dimensionValue.id, new DimensionValue(dimensionValue.id, dimensionValue.caption));
        dimensionValuePositions.get(dimensionId).set(dimensionValueIndex, dimensionValue.id);
      }));
    }));
    gridData.cells.forEach((function(cell) {
      var cellDimensionValues = new Map();
      dimensionPositions.forEach((function(index, dimensionId) {
        var dimensionValue = dimensionValuesByDimensions.get(dimensionId).get(dimensionValuePositions.get(dimensionId).get(cell.dimensionValues[index]));
        cellDimensionValues.set(dimensionId, dimensionValue);
      }));
      cells.push(new Cell(cellDimensionValues, cell.value));
    }));
    return new Grid(dimensions, dimensionValuesByDimensions, cells);
  }}, {});
