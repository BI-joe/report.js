"use strict";
Object.defineProperties(exports, {
  Result: {get: function() {
      return Result;
    }},
  __esModule: {value: true}
});
var Result = function Result() {
  this.results = [];
};
($traceurRuntime.createClass)(Result, {addResult: function(result) {
    this.results.push(result);
  }}, {});
