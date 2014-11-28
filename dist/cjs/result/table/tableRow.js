"use strict";
Object.defineProperties(exports, {
  TableRow: {get: function() {
      return TableRow;
    }},
  __esModule: {value: true}
});
var TableRow = function TableRow() {
  var cells = arguments[0] !== (void 0) ? arguments[0] : [];
  this.cells = cells;
};
($traceurRuntime.createClass)(TableRow, {addCell: function(cell) {
    this.cells.push(cell);
  }}, {});
