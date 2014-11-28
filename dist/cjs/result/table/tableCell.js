"use strict";
Object.defineProperties(exports, {
  TableCell: {get: function() {
      return TableCell;
    }},
  __esModule: {value: true}
});
var TableCell = function TableCell(value) {
  var options = arguments[1] !== (void 0) ? arguments[1] : {};
  this.value = value;
  this.options = options;
};
($traceurRuntime.createClass)(TableCell, {setOption: function(key, value) {
    this.options[key] = value;
  }}, {});
