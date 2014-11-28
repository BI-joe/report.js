"use strict";
Object.defineProperties(exports, {
  SegmentGraphRenderer: {get: function() {
      return SegmentGraphRenderer;
    }},
  __esModule: {value: true}
});
var $___46__46__47__46__46__47_result_47_graph_47_segmentGraph__;
var SegmentGraph = ($___46__46__47__46__46__47_result_47_graph_47_segmentGraph__ = require("../../result/graph/segmentGraph"), $___46__46__47__46__46__47_result_47_graph_47_segmentGraph__ && $___46__46__47__46__46__47_result_47_graph_47_segmentGraph__.__esModule && $___46__46__47__46__46__47_result_47_graph_47_segmentGraph__ || {default: $___46__46__47__46__46__47_result_47_graph_47_segmentGraph__}).SegmentGraph;
var SegmentGraphRenderer = function SegmentGraphRenderer() {
  var graphType = arguments[0] !== (void 0) ? arguments[0] : 'pie';
  var height = arguments[1] !== (void 0) ? arguments[1] : 'auto';
  var width = arguments[2] !== (void 0) ? arguments[2] : 'auto';
  this.graphType = graphType;
  this.height = height;
  this.width = width;
};
($traceurRuntime.createClass)(SegmentGraphRenderer, {render: function(grid) {
    var dimensions = [];
    grid.dimensions.forEach((function(dim) {
      dimensions.push(dim);
    }));
    var labelsDimensionId = 'label',
        mergedGrid = grid.mergeDimensions(dimensions, labelsDimensionId);
    var labels = [];
    mergedGrid.getDimensionValues(mergedGrid.getDimension(labelsDimensionId)).forEach((function(labelDV) {
      var cellDimensionValues = new Map();
      cellDimensionValues.set(labelsDimensionId, labelDV);
      var cell = mergedGrid.getCell(cellDimensionValues);
      labels.push({
        label: labelDV.caption,
        value: cell.value
      });
    }));
    return new SegmentGraph(this.graphType, labels, this.height, this.width);
  }}, {});
