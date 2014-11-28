"use strict";
Object.defineProperties(exports, {
  TableHeaderRenderer: {get: function() {
      return TableHeaderRenderer;
    }},
  __esModule: {value: true}
});
var $___46__46__47__46__46__47_result_47_table_47_tableRow__,
    $___46__46__47__46__46__47_result_47_table_47_tableCell__,
    $___46__46__47__46__46__47_utils_47_maps__;
var TableRow = ($___46__46__47__46__46__47_result_47_table_47_tableRow__ = require("../../result/table/tableRow"), $___46__46__47__46__46__47_result_47_table_47_tableRow__ && $___46__46__47__46__46__47_result_47_table_47_tableRow__.__esModule && $___46__46__47__46__46__47_result_47_table_47_tableRow__ || {default: $___46__46__47__46__46__47_result_47_table_47_tableRow__}).TableRow;
var TableCell = ($___46__46__47__46__46__47_result_47_table_47_tableCell__ = require("../../result/table/tableCell"), $___46__46__47__46__46__47_result_47_table_47_tableCell__ && $___46__46__47__46__46__47_result_47_table_47_tableCell__.__esModule && $___46__46__47__46__46__47_result_47_table_47_tableCell__ || {default: $___46__46__47__46__46__47_result_47_table_47_tableCell__}).TableCell;
var Maps = ($___46__46__47__46__46__47_utils_47_maps__ = require("../../utils/maps"), $___46__46__47__46__46__47_utils_47_maps__ && $___46__46__47__46__46__47_utils_47_maps__.__esModule && $___46__46__47__46__46__47_utils_47_maps__ || {default: $___46__46__47__46__46__47_utils_47_maps__}).Maps;
var TableHeaderRenderer = function TableHeaderRenderer(columnDimensions) {
  var options = arguments[1] !== (void 0) ? arguments[1] : {};
  this.columnDimensions = columnDimensions;
  this.options = options;
};
($traceurRuntime.createClass)(TableHeaderRenderer, {render: function(grid) {
    var headerCells = arguments[1] !== (void 0) ? arguments[1] : [];
    if (this.options.hideHeaders) {
      return [];
    }
    var mapUtils = new Maps(),
        getHeaderRows = function(rows, dimensions, cells) {
          var dimensionValues = arguments[3] !== (void 0) ? arguments[3] : new Map();
          if (dimensions.length === 0) {
            return 1;
          }
          var currentDimensionId = dimensions[0],
              currentDimension = grid.getDimension(currentDimensionId),
              remainingDimensions = dimensions.slice(1),
              countCells = 0,
              currentRow;
          if (rows.has(currentDimensionId)) {
            currentRow = rows.get(currentDimensionId);
          } else {
            currentRow = new TableRow();
            rows.set(currentDimensionId, currentRow);
          }
          grid.getDimensionValues(currentDimension).forEach((function(dimensionValue) {
            var subCells = cells.filter((function(cell) {
              return cell.getDimensionValue(currentDimension) === dimensionValue;
            }));
            if (subCells.length) {
              var currentDimensionValues = mapUtils.clone(dimensionValues);
              currentDimensionValues.set(currentDimensionId, dimensionValue);
              var childCellsCount = getHeaderRows(rows, remainingDimensions, subCells, currentDimensionValues);
              currentRow.addCell(new TableCell(dimensionValue.caption, {
                colspan: childCellsCount,
                header: true
              }));
              countCells += childCellsCount;
            }
          }));
          return countCells;
        };
    var rowsMap = new Map();
    if (this.columnDimensions.length === 0) {
      return headerCells.concat([new TableRow([new TableCell('', {header: true})])]);
    } else {
      getHeaderRows(rowsMap, this.columnDimensions, grid.cells);
      var rows = [];
      rowsMap.forEach((function(row) {
        row.cells = headerCells.concat(row.cells);
        rows.push(row);
      }));
      return rows;
    }
  }}, {});
