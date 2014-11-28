"use strict";
Object.defineProperties(exports, {
  Table: {get: function() {
      return Table;
    }},
  __esModule: {value: true}
});
var Table = function Table() {
  var rows = arguments[0] !== (void 0) ? arguments[0] : [];
  this.rows = rows;
};
($traceurRuntime.createClass)(Table, {
  addRow: function(row) {
    this.rows.push(row);
  },
  getHtml: function() {
    var html = '';
    this.rows.forEach((function(row) {
      var rowHtml = '';
      row.cells.forEach((function(cell) {
        var cellAttributes = [];
        if (cell.options.rowspan !== undefined && cell.options.rowspan > 1) {
          cellAttributes.push('rowspan="' + cell.options.rowspan + '"');
        }
        if (cell.options.colspan !== undefined && cell.options.colspan > 1) {
          cellAttributes.push('colspan="' + cell.options.colspan + '"');
        }
        var tag = cell.options.header === undefined || !cell.options.header ? 'td' : 'th';
        rowHtml += '<' + tag + (cellAttributes.length ? ' ' + cellAttributes.join(' ') : '') + '>' + cell.value + '</' + tag + '>';
      }));
      rowHtml = '<tr>' + rowHtml + '</tr>';
      html += rowHtml;
    }));
    return '<table>' + html + '</table>';
  }
}, {});
