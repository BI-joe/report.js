"use strict";
Object.defineProperties(exports, {
  Grid: {get: function() {
      return Grid;
    }},
  __esModule: {value: true}
});
var $___46__46__47_utils_47_maps__,
    $___46__46__47_data_47_dimension__,
    $___46__46__47_data_47_dimensionValue__,
    $___46__46__47_data_47_cell__;
var Maps = ($___46__46__47_utils_47_maps__ = require("../utils/maps"), $___46__46__47_utils_47_maps__ && $___46__46__47_utils_47_maps__.__esModule && $___46__46__47_utils_47_maps__ || {default: $___46__46__47_utils_47_maps__}).Maps;
var Dimension = ($___46__46__47_data_47_dimension__ = require("../data/dimension"), $___46__46__47_data_47_dimension__ && $___46__46__47_data_47_dimension__.__esModule && $___46__46__47_data_47_dimension__ || {default: $___46__46__47_data_47_dimension__}).Dimension;
var DimensionValue = ($___46__46__47_data_47_dimensionValue__ = require("../data/dimensionValue"), $___46__46__47_data_47_dimensionValue__ && $___46__46__47_data_47_dimensionValue__.__esModule && $___46__46__47_data_47_dimensionValue__ || {default: $___46__46__47_data_47_dimensionValue__}).DimensionValue;
var Cell = ($___46__46__47_data_47_cell__ = require("../data/cell"), $___46__46__47_data_47_cell__ && $___46__46__47_data_47_cell__.__esModule && $___46__46__47_data_47_cell__ || {default: $___46__46__47_data_47_cell__}).Cell;
var Grid = function Grid(dimensions, dimensionValues, cells) {
  this.cells = cells;
  this.dimensions = dimensions;
  this.dimensionValues = dimensionValues;
};
var $Grid = Grid;
($traceurRuntime.createClass)(Grid, {
  getDimension: function(dimensionId) {
    if (!this.dimensions.has(dimensionId)) {
      throw Error('The grid has no dimension "' + dimensionId + '"');
    }
    return this.dimensions.get(dimensionId);
  },
  getDimensionValues: function(dimension) {
    if (!this.dimensionValues.has(dimension.id)) {
      throw Error('The grid has no dimension values for the dimension "' + dimension.id + '"');
    }
    return this.dimensionValues.get(dimension.id);
  },
  getDimenionValuesSets: function(dimensions) {
    var mapUtils = new Maps(),
        getSets = function(sets, dimensions, cells) {
          var set = arguments[3] !== (void 0) ? arguments[3] : new Map();
          var $__4 = this;
          if (dimensions.length === 0) {
            sets.push(set);
            return;
          }
          var currentDimension = dimensions[0],
              remainingDimensions = dimensions.slice(1);
          this.getDimensionValues(currentDimension).forEach((function(dimensionValue) {
            var subCells = cells.filter((function(cell) {
              return cell.getDimensionValue(currentDimension) === dimensionValue;
            }));
            if (subCells.length) {
              var currentSet = mapUtils.clone(set);
              currentSet.set(currentDimension.id, dimensionValue);
              getSets.call($__4, sets, remainingDimensions, subCells, currentSet);
            }
          }), this);
        };
    var sets = [];
    getSets.call(this, sets, dimensions, this.cells);
    return sets;
  },
  getCell: function(dimensionValues) {
    var $__4 = this;
    return this.cells.find((function(cell) {
      var found = true;
      dimensionValues.forEach((function(dimensionValue, dimensionId) {
        if (dimensionValue.id !== cell.getDimensionValue($__4.getDimension(dimensionId)).id) {
          found = false;
        }
      }), $__4);
      return found;
    }), this);
  },
  mergeDimensions: function(dimensions, newDimensionId) {
    var newDimension = new Dimension(newDimensionId, dimensions.map((function(dimension) {
      return dimension.caption;
    })).join(' - ')),
        newDimensions = new Map();
    this.dimensions.forEach((function(dimension) {
      if (dimensions.indexOf(dimension) === -1) {
        newDimensions.set(dimension.id, dimension);
      }
    }));
    newDimensions.set(newDimensionId, newDimension);
    var newDimensionValues = new Map();
    this.dimensionValues.forEach((function(dimensionValues, dimensionId) {
      if (dimensions.find((function(dim) {
        return dim.id === dimensionId;
      })) === undefined) {
        newDimensionValues.set(dimensionId, dimensionValues);
      }
    }));
    newDimensionValues.set(newDimensionId, new Map());
    var newCells = [];
    this.cells.forEach((function(cell) {
      var newCellDimensionValues = new Map(),
          dimensionValuesToMerge = [];
      cell.dimensionValues.forEach((function(dimensionValue, dimensionId) {
        if (dimensions.find((function(dim) {
          return dim.id === dimensionId;
        })) === undefined) {
          newCellDimensionValues.set(dimensionId, dimensionValue);
        } else {
          dimensionValuesToMerge.push(dimensionValue);
        }
      }));
      var newCellDimensionValue = new DimensionValue(dimensionValuesToMerge.map((function(dimensionValue) {
        return dimensionValue.id;
      })).join('-'), dimensionValuesToMerge.map((function(dimensionValue) {
        return dimensionValue.caption;
      })).join(' - '));
      newCellDimensionValues.set(newDimensionId, newCellDimensionValue);
      newDimensionValues.get(newDimensionId).set(newCellDimensionValue.id, newCellDimensionValue);
      newCells.push(new Cell(newCellDimensionValues, cell.value));
    }));
    return new $Grid(newDimensions, newDimensionValues, newCells);
  }
}, {});
