"use strict";
Object.defineProperties(exports, {
  TableBodyRenderer: {get: function() {
      return TableBodyRenderer;
    }},
  __esModule: {value: true}
});
var $___46__46__47__46__46__47_result_47_table_47_tableRow__,
    $___46__46__47__46__46__47_result_47_table_47_tableCell__,
    $___46__46__47__46__46__47_utils_47_maps__;
var TableRow = ($___46__46__47__46__46__47_result_47_table_47_tableRow__ = require("../../result/table/tableRow"), $___46__46__47__46__46__47_result_47_table_47_tableRow__ && $___46__46__47__46__46__47_result_47_table_47_tableRow__.__esModule && $___46__46__47__46__46__47_result_47_table_47_tableRow__ || {default: $___46__46__47__46__46__47_result_47_table_47_tableRow__}).TableRow;
var TableCell = ($___46__46__47__46__46__47_result_47_table_47_tableCell__ = require("../../result/table/tableCell"), $___46__46__47__46__46__47_result_47_table_47_tableCell__ && $___46__46__47__46__46__47_result_47_table_47_tableCell__.__esModule && $___46__46__47__46__46__47_result_47_table_47_tableCell__ || {default: $___46__46__47__46__46__47_result_47_table_47_tableCell__}).TableCell;
var Maps = ($___46__46__47__46__46__47_utils_47_maps__ = require("../../utils/maps"), $___46__46__47__46__46__47_utils_47_maps__ && $___46__46__47__46__46__47_utils_47_maps__.__esModule && $___46__46__47__46__46__47_utils_47_maps__ || {default: $___46__46__47__46__46__47_utils_47_maps__}).Maps;
var TableBodyRenderer = function TableBodyRenderer(rowDimensions, columnDimensions) {
  var options = arguments[2] !== (void 0) ? arguments[2] : {};
  this.rowDimensions = rowDimensions;
  this.columnDimensions = columnDimensions;
  this.options = options;
};
($traceurRuntime.createClass)(TableBodyRenderer, {
  render: function(grid) {
    var mapUtils = new Maps(),
        getBodyCells = function(currentRow, columnDimensions, cells, dimensionValues) {
          var colSets = grid.getDimenionValuesSets(columnDimensions.map((function(dimension) {
            return grid.getDimension(dimension);
          })));
          colSets.forEach((function(set) {
            var cellSet = mapUtils.sum(dimensionValues, set);
            var cell = grid.getCell(cellSet);
            if (cell) {
              currentRow.addCell(new TableCell(cell.value));
            } else {
              currentRow.addCell(new TableCell(''));
            }
          }));
        },
        getRows = function(rows, rowDimensions, columnDimensions, cells) {
          var dimensionValues = arguments[4] !== (void 0) ? arguments[4] : new Map();
          var row = arguments[5] !== (void 0) ? arguments[5] : null;
          var $__3 = this;
          if (rowDimensions.length === 0) {
            getBodyCells(row, columnDimensions, cells, dimensionValues);
            return 1;
          }
          var currentDimensionId = rowDimensions[0],
              currentDimension = grid.getDimension(currentDimensionId),
              remainingDimensions = rowDimensions.slice(1),
              countCells = 0,
              first = true;
          grid.getDimensionValues(currentDimension).forEach((function(dimensionValue) {
            var subCells = cells.filter((function(cell) {
              return cell.getDimensionValue(currentDimension) === dimensionValue;
            }));
            if (subCells.length) {
              var currentRow = row;
              if (row === null || !first) {
                currentRow = new TableRow();
                rows.push(currentRow);
              }
              first = false;
              var currentDimensionValues = mapUtils.clone(dimensionValues);
              currentDimensionValues.set(currentDimensionId, dimensionValue);
              var tableCell;
              if (!$__3.options.hideHeaders) {
                tableCell = new TableCell(dimensionValue.caption, {header: true});
                currentRow.addCell(tableCell);
              }
              var childCellsCount = getRows.call($__3, rows, remainingDimensions, columnDimensions, subCells, currentDimensionValues, currentRow);
              if (!$__3.options.hideHeaders) {
                tableCell.setOption('rowspan', childCellsCount);
              }
              countCells += childCellsCount;
            }
          }), this);
          return countCells;
        };
    var rows = [];
    getRows.call(this, rows, this.rowDimensions, this.columnDimensions, grid.cells);
    return rows;
  },
  getHeaderCells: function() {
    if (this.options.hideHeaders) {
      return [];
    }
    return [new TableCell('', {
      colspan: this.rowDimensions.length,
      header: true
    })];
  }
}, {});
