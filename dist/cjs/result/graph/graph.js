"use strict";
Object.defineProperties(exports, {
  Graph: {get: function() {
      return Graph;
    }},
  __esModule: {value: true}
});
var Graph = function Graph(graphType) {
  var labels = arguments[1] !== (void 0) ? arguments[1] : [];
  var datasets = arguments[2] !== (void 0) ? arguments[2] : [];
  var height = arguments[3] !== (void 0) ? arguments[3] : 'auto';
  var width = arguments[4] !== (void 0) ? arguments[4] : 'auto';
  this.graphType = graphType;
  this.labels = labels;
  this.datasets = datasets;
  this.height = height;
  this.width = width;
};
($traceurRuntime.createClass)(Graph, {addDataset: function(dataset) {
    this.datasets.push(dataset);
  }}, {});
