"use strict";
Object.defineProperties(exports, {
  GraphRenderer: {get: function() {
      return GraphRenderer;
    }},
  __esModule: {value: true}
});
var $___46__46__47__46__46__47_result_47_graph_47_graph__;
var Graph = ($___46__46__47__46__46__47_result_47_graph_47_graph__ = require("../../result/graph/graph"), $___46__46__47__46__46__47_result_47_graph_47_graph__ && $___46__46__47__46__46__47_result_47_graph_47_graph__.__esModule && $___46__46__47__46__46__47_result_47_graph_47_graph__ || {default: $___46__46__47__46__46__47_result_47_graph_47_graph__}).Graph;
var GraphRenderer = function GraphRenderer(datasetsDimensions, labelsDimensions) {
  var graphType = arguments[2] !== (void 0) ? arguments[2] : 'line';
  var height = arguments[3] !== (void 0) ? arguments[3] : 'auto';
  var width = arguments[4] !== (void 0) ? arguments[4] : 'auto';
  this.datasetsDimensions = datasetsDimensions;
  this.labelsDimensions = labelsDimensions;
  this.graphType = graphType;
  this.height = height;
  this.width = width;
};
($traceurRuntime.createClass)(GraphRenderer, {render: function(grid) {
    var datasetsDimensionId = 'dataset',
        labelsDimensionId = 'label',
        mergedGrid = grid.mergeDimensions(this.datasetsDimensions.map((function(dimension) {
          return grid.getDimension(dimension);
        })), datasetsDimensionId);
    mergedGrid = mergedGrid.mergeDimensions(this.labelsDimensions.map((function(dimension) {
      return grid.getDimension(dimension);
    })), labelsDimensionId);
    var labels = [];
    mergedGrid.getDimensionValues(mergedGrid.getDimension(labelsDimensionId)).forEach((function(labelDV) {
      labels.push(labelDV.caption);
    }));
    var datasets = [];
    mergedGrid.getDimensionValues(mergedGrid.getDimension(datasetsDimensionId)).forEach((function(datasetDV) {
      var dataset = {
        label: datasetDV.caption,
        data: []
      };
      mergedGrid.getDimensionValues(mergedGrid.getDimension(labelsDimensionId)).forEach((function(labelDV) {
        var cellDimensionValues = new Map();
        cellDimensionValues.set(datasetsDimensionId, datasetDV);
        cellDimensionValues.set(labelsDimensionId, labelDV);
        var cell = mergedGrid.getCell(cellDimensionValues);
        if (cell) {
          dataset.data.push(cell.value);
        } else {
          dataset.data.push(null);
        }
      }));
      datasets.push(dataset);
    }));
    return new Graph(this.graphType, labels, datasets, this.height, this.width);
  }}, {});
