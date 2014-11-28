"use strict";
Object.defineProperties(exports, {
  SegmentGraph: {get: function() {
      return SegmentGraph;
    }},
  __esModule: {value: true}
});
var SegmentGraph = function SegmentGraph(graphType) {
  var labels = arguments[1] !== (void 0) ? arguments[1] : [];
  var height = arguments[2] !== (void 0) ? arguments[2] : 'auto';
  var width = arguments[3] !== (void 0) ? arguments[3] : 'auto';
  this.graphType = graphType;
  this.labels = labels;
  this.height = height;
  this.width = width;
};
($traceurRuntime.createClass)(SegmentGraph, {}, {});
