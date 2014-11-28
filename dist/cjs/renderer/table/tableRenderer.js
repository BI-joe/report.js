"use strict";
Object.defineProperties(exports, {
  TableRenderer: {get: function() {
      return TableRenderer;
    }},
  __esModule: {value: true}
});
var $___46__46__47__46__46__47_result_47_table_47_table__,
    $___46__46__47__46__46__47_renderer_47_table_47_tableHeaderRenderer__,
    $___46__46__47__46__46__47_renderer_47_table_47_tableBodyRenderer__;
var Table = ($___46__46__47__46__46__47_result_47_table_47_table__ = require("../../result/table/table"), $___46__46__47__46__46__47_result_47_table_47_table__ && $___46__46__47__46__46__47_result_47_table_47_table__.__esModule && $___46__46__47__46__46__47_result_47_table_47_table__ || {default: $___46__46__47__46__46__47_result_47_table_47_table__}).Table;
var TableHeaderRenderer = ($___46__46__47__46__46__47_renderer_47_table_47_tableHeaderRenderer__ = require("../../renderer/table/tableHeaderRenderer"), $___46__46__47__46__46__47_renderer_47_table_47_tableHeaderRenderer__ && $___46__46__47__46__46__47_renderer_47_table_47_tableHeaderRenderer__.__esModule && $___46__46__47__46__46__47_renderer_47_table_47_tableHeaderRenderer__ || {default: $___46__46__47__46__46__47_renderer_47_table_47_tableHeaderRenderer__}).TableHeaderRenderer;
var TableBodyRenderer = ($___46__46__47__46__46__47_renderer_47_table_47_tableBodyRenderer__ = require("../../renderer/table/tableBodyRenderer"), $___46__46__47__46__46__47_renderer_47_table_47_tableBodyRenderer__ && $___46__46__47__46__46__47_renderer_47_table_47_tableBodyRenderer__.__esModule && $___46__46__47__46__46__47_renderer_47_table_47_tableBodyRenderer__ || {default: $___46__46__47__46__46__47_renderer_47_table_47_tableBodyRenderer__}).TableBodyRenderer;
var TableRenderer = function TableRenderer(rowDimensions, columnDimensions) {
  var options = arguments[2] !== (void 0) ? arguments[2] : {};
  this.rowDimensions = rowDimensions;
  this.columnDimensions = columnDimensions;
  this.options = options;
};
($traceurRuntime.createClass)(TableRenderer, {render: function(grid) {
    var table = new Table(),
        tableHeaderRenderer = new TableHeaderRenderer(this.columnDimensions, {hideHeaders: this.options.hideColumnHeaders}),
        tableBodyRenderer = new TableBodyRenderer(this.rowDimensions, this.columnDimensions, {hideHeaders: this.options.hideRowHeaders}),
        headerRows = tableHeaderRenderer.render(grid, tableBodyRenderer.getHeaderCells()),
        bodyRows = tableBodyRenderer.render(grid);
    headerRows.forEach((function(row) {
      table.addRow(row);
    }));
    bodyRows.forEach((function(row) {
      table.addRow(row);
    }));
    return table;
  }}, {});
