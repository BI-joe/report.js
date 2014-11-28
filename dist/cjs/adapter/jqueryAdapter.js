"use strict";
Object.defineProperties(exports, {
  JQueryAdapter: {get: function() {
      return JQueryAdapter;
    }},
  __esModule: {value: true}
});
var JQueryAdapter = function JQueryAdapter() {};
($traceurRuntime.createClass)(JQueryAdapter, {renderTableTo: function(element, table) {
    element.html(table.getHtml());
  }}, {});
