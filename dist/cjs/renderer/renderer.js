"use strict";
Object.defineProperties(exports, {
  Renderer: {get: function() {
      return Renderer;
    }},
  __esModule: {value: true}
});
var $___46__46__47_data_47_gridFactory__,
    $__table_47_tableRenderer__,
    $__graph_47_graphRenderer__,
    $__graph_47_segmentGraphRenderer__;
var GridFactory = ($___46__46__47_data_47_gridFactory__ = require("../data/gridFactory"), $___46__46__47_data_47_gridFactory__ && $___46__46__47_data_47_gridFactory__.__esModule && $___46__46__47_data_47_gridFactory__ || {default: $___46__46__47_data_47_gridFactory__}).GridFactory;
var TableRenderer = ($__table_47_tableRenderer__ = require("./table/tableRenderer"), $__table_47_tableRenderer__ && $__table_47_tableRenderer__.__esModule && $__table_47_tableRenderer__ || {default: $__table_47_tableRenderer__}).TableRenderer;
var GraphRenderer = ($__graph_47_graphRenderer__ = require("./graph/graphRenderer"), $__graph_47_graphRenderer__ && $__graph_47_graphRenderer__.__esModule && $__graph_47_graphRenderer__ || {default: $__graph_47_graphRenderer__}).GraphRenderer;
var SegmentGraphRenderer = ($__graph_47_segmentGraphRenderer__ = require("./graph/segmentGraphRenderer"), $__graph_47_segmentGraphRenderer__ && $__graph_47_segmentGraphRenderer__.__esModule && $__graph_47_segmentGraphRenderer__ || {default: $__graph_47_segmentGraphRenderer__}).SegmentGraphRenderer;
var Renderer = function Renderer() {};
($traceurRuntime.createClass)(Renderer, {render: function(options) {
    var gridFactory = new GridFactory(),
        grid = gridFactory.buildFromJson(options.data),
        output;
    switch (options.layout.type) {
      case 'table':
        var tableRenderer = new TableRenderer(options.layout.rows, options.layout.columns, options.layout.options);
        output = tableRenderer.render(grid);
        break;
      case 'graph':
        var graphRenderer = new GraphRenderer(options.layout.datasets, options.layout.labels, options.layout.graphType, options.layout.height, options.layout.width);
        output = graphRenderer.render(grid);
        break;
      case 'segmentGraph':
        var segmentGraphRenderer = new SegmentGraphRenderer(options.layout.graphType, options.layout.height, options.layout.width);
        output = segmentGraphRenderer.render(grid);
        break;
      default:
        throw Error('unknown layout type');
    }
    return output;
  }}, {});
