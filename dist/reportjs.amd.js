define("adapter/chartjsAdapter", ['utils/colors'], function($__0) {
  "use strict";
  var __moduleName = "adapter/chartjsAdapter";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  var Colors = $__0.Colors;
  var ChartjsAdapter = function ChartjsAdapter() {};
  ($traceurRuntime.createClass)(ChartjsAdapter, {
    renderGraphTo: function(element, graph) {
      var getChartData = function(graph) {
        var index = 0,
            colors = new Colors(),
            colorScheme = colors.defaultScheme();
        return {
          labels: graph.labels,
          datasets: graph.datasets.map((function(dataset) {
            var colorIndex = index % colorScheme.length,
                rgbColor = colors.hexToRgb(colorScheme[$traceurRuntime.toProperty(colorIndex)]);
            dataset.fillColor = colors.rgbToString(rgbColor, 0.2);
            dataset.strokeColor = colors.rgbToString(rgbColor, 1);
            dataset.pointColor = colors.rgbToString(rgbColor, 1);
            dataset.pointStrokeColor = colors.rgbToString(rgbColor, 0.1);
            dataset.pointHighlightFill = colors.rgbToString(rgbColor, 0.1);
            dataset.pointHighlightStroke = colors.rgbToString(rgbColor, 1);
            index++;
            return dataset;
          }))
        };
      };
      element.prepend('<canvas width="' + element.width() + '" height="400"></canvas>');
      var context = element.find('canvas:first').get(0).getContext('2d'),
          chart = new Chart(context);
      switch (graph.graphType) {
        case 'line':
          chart.Line(getChartData(graph));
          break;
        case 'bar':
          chart.Bar(getChartData(graph));
          break;
        case 'radar':
          chart.Radar(getChartData(graph));
          break;
        default:
          throw Error('Unknown graph type "' + graph.graphType + '"');
      }
    },
    renderSegmentGraphTo: function(element, graph) {
      var getChartData = function(graph) {
        var index = 0,
            colors = new Colors(),
            colorScheme = colors.defaultScheme();
        return graph.labels.map((function(label) {
          var colorIndex = index % colorScheme.length,
              rgbColor = colors.hexToRgb(colorScheme[$traceurRuntime.toProperty(colorIndex)]);
          label.color = colors.rgbToString(rgbColor, 0.8);
          label.highlight = colors.rgbToString(rgbColor, 1);
          index++;
          return label;
        }));
      };
      element.prepend('<canvas width="' + element.width() + '" height="400"></canvas>');
      var context = element.find('canvas:first').get(0).getContext('2d'),
          chart = new Chart(context);
      switch (graph.graphType) {
        case 'pie':
          chart.Pie(getChartData(graph));
          break;
        case 'polarArea':
          chart.PolarArea(getChartData(graph));
          break;
        case 'doughnut':
          chart.Doughnut(getChartData(graph));
          break;
        default:
          throw Error('Unknown segment graph type "' + graph.graphType + '"');
      }
    }
  }, {});
  return {
    get ChartjsAdapter() {
      return ChartjsAdapter;
    },
    __esModule: true
  };
});

define("data/cell", [], function() {
  "use strict";
  var __moduleName = "data/cell";
  var Cell = function Cell(dimensionValues, value) {
    this.dimensionValues = dimensionValues;
    this.value = value;
  };
  ($traceurRuntime.createClass)(Cell, {getDimensionValue: function(dimension) {
      if (!this.dimensionValues.has(dimension.id)) {
        throw Error('The cell has no dimension value for the dimension "' + dimension.id + '"');
      }
      return this.dimensionValues.get(dimension.id);
    }}, {});
  return {
    get Cell() {
      return Cell;
    },
    __esModule: true
  };
});

define("data/dimension", [], function() {
  "use strict";
  var __moduleName = "data/dimension";
  var Dimension = function Dimension(id, caption) {
    this.id = id;
    this.caption = caption === undefined ? id : caption;
  };
  ($traceurRuntime.createClass)(Dimension, {}, {});
  return {
    get Dimension() {
      return Dimension;
    },
    __esModule: true
  };
});

define("data/dimensionValue", [], function() {
  "use strict";
  var __moduleName = "data/dimensionValue";
  var DimensionValue = function DimensionValue(id, caption) {
    this.id = id;
    this.caption = caption === undefined ? id : caption;
  };
  ($traceurRuntime.createClass)(DimensionValue, {}, {});
  return {
    get DimensionValue() {
      return DimensionValue;
    },
    __esModule: true
  };
});

define("data/grid", ['utils/maps', 'data/dimension', 'data/dimensionValue', 'data/cell'], function($__0,$__2,$__4,$__6) {
  "use strict";
  var __moduleName = "data/grid";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  if (!$__4 || !$__4.__esModule)
    $__4 = {default: $__4};
  if (!$__6 || !$__6.__esModule)
    $__6 = {default: $__6};
  var Maps = $__0.Maps;
  var Dimension = $__2.Dimension;
  var DimensionValue = $__4.DimensionValue;
  var Cell = $__6.Cell;
  var Grid = function Grid(dimensions, dimensionValues, cells) {
    this.cells = cells;
    this.dimensions = dimensions;
    this.dimensionValues = dimensionValues;
  };
  var $Grid = Grid;
  ($traceurRuntime.createClass)(Grid, {
    getDimension: function(dimensionId) {
      if (!this.dimensions.has(dimensionId)) {
        throw Error('The grid has no dimension "' + dimensionId + '"');
      }
      return this.dimensions.get(dimensionId);
    },
    getDimensionValues: function(dimension) {
      if (!this.dimensionValues.has(dimension.id)) {
        throw Error('The grid has no dimension values for the dimension "' + dimension.id + '"');
      }
      return this.dimensionValues.get(dimension.id);
    },
    getDimenionValuesSets: function(dimensions) {
      var mapUtils = new Maps(),
          getSets = function(sets, dimensions, cells) {
            var set = arguments[3] !== (void 0) ? arguments[3] : new Map();
            var $__8 = this;
            if (dimensions.length === 0) {
              sets.push(set);
              return;
            }
            var currentDimension = dimensions[0],
                remainingDimensions = dimensions.slice(1);
            this.getDimensionValues(currentDimension).forEach((function(dimensionValue) {
              var currentSet$__10;
              var subCells = cells.filter((function(cell) {
                return cell.getDimensionValue(currentDimension) === dimensionValue;
              }));
              if (subCells.length) {
                currentSet$__10 = mapUtils.clone(set);
                currentSet$__10.set(currentDimension.id, dimensionValue);
                getSets.call($__8, sets, remainingDimensions, subCells, currentSet$__10);
              }
            }), this);
          };
      var sets = [];
      getSets.call(this, sets, dimensions, this.cells);
      return sets;
    },
    getCell: function(dimensionValues) {
      var $__8 = this;
      return this.cells.find((function(cell) {
        var found = true;
        dimensionValues.forEach((function(dimensionValue, dimensionId) {
          if (dimensionValue.id !== cell.getDimensionValue($__8.getDimension(dimensionId)).id) {
            found = false;
          }
        }), $__8);
        return found;
      }), this);
    },
    mergeDimensions: function(dimensions, newDimensionId) {
      var newDimension = new Dimension(newDimensionId, dimensions.map((function(dimension) {
        return dimension.caption;
      })).join(' - ')),
          newDimensions = new Map();
      this.dimensions.forEach((function(dimension) {
        if (dimensions.indexOf(dimension) === -1) {
          newDimensions.set(dimension.id, dimension);
        }
      }));
      newDimensions.set(newDimensionId, newDimension);
      var newDimensionValues = new Map();
      this.dimensionValues.forEach((function(dimensionValues, dimensionId) {
        if (dimensions.find((function(dim) {
          return dim.id === dimensionId;
        })) === undefined) {
          newDimensionValues.set(dimensionId, dimensionValues);
        }
      }));
      newDimensionValues.set(newDimensionId, new Map());
      var newCells = [];
      this.cells.forEach((function(cell) {
        var newCellDimensionValues = new Map(),
            dimensionValuesToMerge = [];
        cell.dimensionValues.forEach((function(dimensionValue, dimensionId) {
          if (dimensions.find((function(dim) {
            return dim.id === dimensionId;
          })) === undefined) {
            newCellDimensionValues.set(dimensionId, dimensionValue);
          } else {
            dimensionValuesToMerge.push(dimensionValue);
          }
        }));
        var newCellDimensionValue = new DimensionValue(dimensionValuesToMerge.map((function(dimensionValue) {
          return dimensionValue.id;
        })).join('-'), dimensionValuesToMerge.map((function(dimensionValue) {
          return dimensionValue.caption;
        })).join(' - '));
        newCellDimensionValues.set(newDimensionId, newCellDimensionValue);
        newDimensionValues.get(newDimensionId).set(newCellDimensionValue.id, newCellDimensionValue);
        newCells.push(new Cell(newCellDimensionValues, cell.value));
      }));
      return new $Grid(newDimensions, newDimensionValues, newCells);
    }
  }, {});
  return {
    get Grid() {
      return Grid;
    },
    __esModule: true
  };
});

define("data/gridFactory", ['data/dimension', 'data/dimensionValue', 'data/cell', 'data/grid'], function($__0,$__2,$__4,$__6) {
  "use strict";
  var __moduleName = "data/gridFactory";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  if (!$__4 || !$__4.__esModule)
    $__4 = {default: $__4};
  if (!$__6 || !$__6.__esModule)
    $__6 = {default: $__6};
  var Dimension = $__0.Dimension;
  var DimensionValue = $__2.DimensionValue;
  var Cell = $__4.Cell;
  var Grid = $__6.Grid;
  var GridFactory = function GridFactory() {};
  ($traceurRuntime.createClass)(GridFactory, {buildFromJson: function(gridData) {
      var dimensions = new Map(),
          dimensionValuesByDimensions = new Map(),
          cells = [],
          dimensionPositions = new Map(),
          dimensionValuePositions = new Map();
      ;
      gridData.dimensions.forEach((function(dimension, index) {
        dimensions.set(dimension.id, new Dimension(dimension.id, dimension.caption));
        dimensionPositions.set(dimension.id, index);
        dimensionValuesByDimensions.set(dimension.id, new Map());
        dimensionValuePositions.set(dimension.id, new Map());
      }));
      dimensionPositions.forEach((function(index, dimensionId) {
        gridData.dimensionValues[$traceurRuntime.toProperty(index)].forEach((function(dimensionValue, dimensionValueIndex) {
          dimensionValuesByDimensions.get(dimensionId).set(dimensionValue.id, new DimensionValue(dimensionValue.id, dimensionValue.caption));
          dimensionValuePositions.get(dimensionId).set(dimensionValueIndex, dimensionValue.id);
        }));
      }));
      gridData.cells.forEach((function(cell) {
        var cellDimensionValues = new Map();
        dimensionPositions.forEach((function(index, dimensionId) {
          var dimensionValue = dimensionValuesByDimensions.get(dimensionId).get(dimensionValuePositions.get(dimensionId).get(cell.dimensionValues[$traceurRuntime.toProperty(index)]));
          cellDimensionValues.set(dimensionId, dimensionValue);
        }));
        cells.push(new Cell(cellDimensionValues, cell.value));
      }));
      return new Grid(dimensions, dimensionValuesByDimensions, cells);
    }}, {});
  return {
    get GridFactory() {
      return GridFactory;
    },
    __esModule: true
  };
});

define("renderer/graph/graphRenderer", ['result/graph/graph'], function($__0) {
  "use strict";
  var __moduleName = "renderer/graph/graphRenderer";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  var Graph = $__0.Graph;
  var GraphRenderer = function GraphRenderer(datasetsDimensions, labelsDimensions) {
    var graphType = arguments[2] !== (void 0) ? arguments[2] : 'line';
    this.datasetsDimensions = datasetsDimensions;
    this.labelsDimensions = labelsDimensions;
    this.graphType = graphType;
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
      return new Graph(this.graphType, labels, datasets);
    }}, {});
  return {
    get GraphRenderer() {
      return GraphRenderer;
    },
    __esModule: true
  };
});

define("renderer/graph/segmentGraphRenderer", ['result/graph/segmentGraph'], function($__0) {
  "use strict";
  var __moduleName = "renderer/graph/segmentGraphRenderer";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  var SegmentGraph = $__0.SegmentGraph;
  var SegmentGraphRenderer = function SegmentGraphRenderer() {
    var graphType = arguments[0] !== (void 0) ? arguments[0] : 'pie';
    this.graphType = graphType;
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
      return new SegmentGraph(this.graphType, labels);
    }}, {});
  return {
    get SegmentGraphRenderer() {
      return SegmentGraphRenderer;
    },
    __esModule: true
  };
});

define("renderer/table/tableBodyRenderer", ['result/table/tableRow', 'result/table/tableCell', 'utils/maps'], function($__0,$__2,$__4) {
  "use strict";
  var __moduleName = "renderer/table/tableBodyRenderer";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  if (!$__4 || !$__4.__esModule)
    $__4 = {default: $__4};
  var TableRow = $__0.TableRow;
  var TableCell = $__2.TableCell;
  var Maps = $__4.Maps;
  var TableBodyRenderer = function TableBodyRenderer(rowDimensions, columnDimensions) {
    this.rowDimensions = rowDimensions;
    this.columnDimensions = columnDimensions;
  };
  ($traceurRuntime.createClass)(TableBodyRenderer, {
    render: function(grid) {
      var mapUtils = new Maps(),
          getBodyCells = function(currentRow, columnDimensions, cells, dimensionValues) {
            var colSets = grid.getDimenionValuesSets(columnDimensions.map((function(dimension) {
              return grid.getDimension(dimension);
            })));
            colSets.forEach((function(set) {
              var cellSet = mapUtils.sum(dimensionValues, set);
              var cell = grid.getCell(cellSet);
              if (cell) {
                currentRow.addCell(new TableCell(cell.value));
              } else {
                currentRow.addCell(new TableCell(''));
              }
            }));
          },
          getRows = function(rows, rowDimensions, columnDimensions, cells) {
            var dimensionValues = arguments[4] !== (void 0) ? arguments[4] : new Map();
            var row = arguments[5] !== (void 0) ? arguments[5] : null;
            if (rowDimensions.length === 0) {
              getBodyCells(row, columnDimensions, cells, dimensionValues);
              return 1;
            }
            var currentDimensionId = rowDimensions[0],
                currentDimension = grid.getDimension(currentDimensionId),
                remainingDimensions = rowDimensions.slice(1),
                countCells = 0,
                first = true;
            grid.getDimensionValues(currentDimension).forEach((function(dimensionValue) {
              var currentRow$__7;
              var currentDimensionValues$__8;
              var tableCell$__9;
              var childCellsCount$__10;
              var subCells = cells.filter((function(cell) {
                return cell.getDimensionValue(currentDimension) === dimensionValue;
              }));
              if (subCells.length) {
                currentRow$__7 = row;
                if (row === null || !first) {
                  currentRow$__7 = new TableRow();
                  rows.push(currentRow$__7);
                }
                first = false;
                currentDimensionValues$__8 = mapUtils.clone(dimensionValues);
                currentDimensionValues$__8.set(currentDimensionId, dimensionValue);
                tableCell$__9 = new TableCell(dimensionValue.caption, {header: true});
                currentRow$__7.addCell(tableCell$__9);
                childCellsCount$__10 = getRows(rows, remainingDimensions, columnDimensions, subCells, currentDimensionValues$__8, currentRow$__7);
                tableCell$__9.setOption('rowspan', childCellsCount$__10);
                countCells += childCellsCount$__10;
              }
            }));
            return countCells;
          };
      var rows = [];
      getRows(rows, this.rowDimensions, this.columnDimensions, grid.cells);
      return rows;
    },
    getHeaderCells: function() {
      return [new TableCell('', {
        colspan: this.rowDimensions.length,
        header: true
      })];
    }
  }, {});
  return {
    get TableBodyRenderer() {
      return TableBodyRenderer;
    },
    __esModule: true
  };
});

define("renderer/table/tableHeaderRenderer", ['result/table/tableRow', 'result/table/tableCell', 'utils/maps'], function($__0,$__2,$__4) {
  "use strict";
  var __moduleName = "renderer/table/tableHeaderRenderer";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  if (!$__4 || !$__4.__esModule)
    $__4 = {default: $__4};
  var TableRow = $__0.TableRow;
  var TableCell = $__2.TableCell;
  var Maps = $__4.Maps;
  var TableHeaderRenderer = function TableHeaderRenderer(columnDimensions) {
    this.columnDimensions = columnDimensions;
  };
  ($traceurRuntime.createClass)(TableHeaderRenderer, {render: function(grid) {
      var rows$__9;
      var headerCells = arguments[1] !== (void 0) ? arguments[1] : [];
      var mapUtils = new Maps(),
          getHeaderRows = function(rows, dimensions, cells) {
            var dimensionValues = arguments[3] !== (void 0) ? arguments[3] : new Map();
            if (dimensions.length === 0) {
              return 1;
            }
            var currentDimensionId = dimensions[0],
                currentDimension = grid.getDimension(currentDimensionId),
                remainingDimensions = dimensions.slice(1),
                countCells = 0,
                currentRow;
            if (rows.has(currentDimensionId)) {
              currentRow = rows.get(currentDimensionId);
            } else {
              currentRow = new TableRow();
              rows.set(currentDimensionId, currentRow);
            }
            grid.getDimensionValues(currentDimension).forEach((function(dimensionValue) {
              var currentDimensionValues$__7;
              var childCellsCount$__8;
              var subCells = cells.filter((function(cell) {
                return cell.getDimensionValue(currentDimension) === dimensionValue;
              }));
              if (subCells.length) {
                currentDimensionValues$__7 = mapUtils.clone(dimensionValues);
                currentDimensionValues$__7.set(currentDimensionId, dimensionValue);
                childCellsCount$__8 = getHeaderRows(rows, remainingDimensions, subCells, currentDimensionValues$__7);
                currentRow.addCell(new TableCell(dimensionValue.caption, {
                  colspan: childCellsCount$__8,
                  header: true
                }));
                countCells += childCellsCount$__8;
              }
            }));
            return countCells;
          };
      var rowsMap = new Map();
      if (this.columnDimensions.length === 0) {
        return headerCells.concat([new TableRow([new TableCell('', {header: true})])]);
      } else {
        getHeaderRows(rowsMap, this.columnDimensions, grid.cells);
        rows$__9 = [];
        rowsMap.forEach((function(row) {
          row.cells = headerCells.concat(row.cells);
          rows$__9.push(row);
        }));
        return rows$__9;
      }
    }}, {});
  return {
    get TableHeaderRenderer() {
      return TableHeaderRenderer;
    },
    __esModule: true
  };
});

define("renderer/table/tableRenderer", ['result/table/table', 'renderer/table/tableHeaderRenderer', 'renderer/table/tableBodyRenderer'], function($__0,$__2,$__4) {
  "use strict";
  var __moduleName = "renderer/table/tableRenderer";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  if (!$__4 || !$__4.__esModule)
    $__4 = {default: $__4};
  var Table = $__0.Table;
  var TableHeaderRenderer = $__2.TableHeaderRenderer;
  var TableBodyRenderer = $__4.TableBodyRenderer;
  var TableRenderer = function TableRenderer(rowDimensions, columnDimensions) {
    this.rowDimensions = rowDimensions;
    this.columnDimensions = columnDimensions;
  };
  ($traceurRuntime.createClass)(TableRenderer, {render: function(grid) {
      var table = new Table(),
          tableHeaderRenderer = new TableHeaderRenderer(this.columnDimensions),
          tableBodyRenderer = new TableBodyRenderer(this.rowDimensions, this.columnDimensions),
          headerRows = tableHeaderRenderer.render(grid, tableBodyRenderer.getHeaderCells()),
          bodyRows = tableBodyRenderer.render(grid);
      headerRows.forEach((function(row) {
        table.addRow(row);
      }));
      bodyRows.forEach((function(row) {
        table.addRow(row);
      }));
      return table;
    }}, {});
  return {
    get TableRenderer() {
      return TableRenderer;
    },
    __esModule: true
  };
});

define("reportjs", ['data/gridFactory', 'renderer/table/tableRenderer', 'renderer/graph/graphRenderer', 'renderer/graph/segmentGraphRenderer', 'adapter/chartjsAdapter'], function($__0,$__2,$__4,$__6,$__8) {
  "use strict";
  var __moduleName = "reportjs";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  if (!$__4 || !$__4.__esModule)
    $__4 = {default: $__4};
  if (!$__6 || !$__6.__esModule)
    $__6 = {default: $__6};
  if (!$__8 || !$__8.__esModule)
    $__8 = {default: $__8};
  var GridFactory = $__0.GridFactory;
  var TableRenderer = $__2.TableRenderer;
  var GraphRenderer = $__4.GraphRenderer;
  var SegmentGraphRenderer = $__6.SegmentGraphRenderer;
  var ChartjsAdapter = $__8.ChartjsAdapter;
  var Renderer = function Renderer() {};
  ($traceurRuntime.createClass)(Renderer, {renderTo: function(element, options) {
      var tableRenderer$__11,
          table$__12;
      var graphRenderer$__13,
          graph$__14,
          adapter$__15;
      var graphRenderer$__16,
          graph$__17,
          adapter$__18;
      var gridFactory = new GridFactory(),
          grid = gridFactory.buildFromJson(options.data);
      if (options.layout.type === 'table') {
        tableRenderer$__11 = new TableRenderer(options.layout.rows, options.layout.columns);
        table$__12 = tableRenderer$__11.render(grid);
        element.html(table$__12.getHtml());
      } else if (options.layout.type === 'graph') {
        graphRenderer$__13 = new GraphRenderer(options.layout.datasets, options.layout.labels, options.layout.graphType);
        graph$__14 = graphRenderer$__13.render(grid);
        adapter$__15 = new ChartjsAdapter();
        adapter$__15.renderGraphTo(element, graph$__14);
      } else if (options.layout.type === 'segmentGraph') {
        graphRenderer$__16 = new SegmentGraphRenderer(options.layout.graphType);
        graph$__17 = graphRenderer$__16.render(grid);
        adapter$__18 = new ChartjsAdapter();
        adapter$__18.renderSegmentGraphTo(element, graph$__17);
      }
    }}, {});
  return {
    get Renderer() {
      return Renderer;
    },
    __esModule: true
  };
});

define("result/graph/graph", [], function() {
  "use strict";
  var __moduleName = "result/graph/graph";
  var Graph = function Graph(graphType) {
    var labels = arguments[1] !== (void 0) ? arguments[1] : [];
    var datasets = arguments[2] !== (void 0) ? arguments[2] : [];
    this.graphType = graphType;
    this.labels = labels;
    this.datasets = datasets;
  };
  ($traceurRuntime.createClass)(Graph, {addDataset: function(dataset) {
      this.datasets.push(dataset);
    }}, {});
  return {
    get Graph() {
      return Graph;
    },
    __esModule: true
  };
});

define("result/graph/segmentGraph", [], function() {
  "use strict";
  var __moduleName = "result/graph/segmentGraph";
  var SegmentGraph = function SegmentGraph(graphType) {
    var labels = arguments[1] !== (void 0) ? arguments[1] : [];
    this.graphType = graphType;
    this.labels = labels;
  };
  ($traceurRuntime.createClass)(SegmentGraph, {}, {});
  return {
    get SegmentGraph() {
      return SegmentGraph;
    },
    __esModule: true
  };
});

define("result/result", [], function() {
  "use strict";
  var __moduleName = "result/result";
  var Result = function Result() {
    this.results = [];
  };
  ($traceurRuntime.createClass)(Result, {addResult: function(result) {
      this.results.push(result);
    }}, {});
  return {
    get Result() {
      return Result;
    },
    __esModule: true
  };
});

define("result/table/table", [], function() {
  "use strict";
  var __moduleName = "result/table/table";
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
  return {
    get Table() {
      return Table;
    },
    __esModule: true
  };
});

define("result/table/tableCell", [], function() {
  "use strict";
  var __moduleName = "result/table/tableCell";
  var TableCell = function TableCell(value) {
    var options = arguments[1] !== (void 0) ? arguments[1] : {};
    this.value = value;
    this.options = options;
  };
  ($traceurRuntime.createClass)(TableCell, {setOption: function(key, value) {
      $traceurRuntime.setProperty(this.options, key, value);
    }}, {});
  return {
    get TableCell() {
      return TableCell;
    },
    __esModule: true
  };
});

define("result/table/tableRow", [], function() {
  "use strict";
  var __moduleName = "result/table/tableRow";
  var TableRow = function TableRow() {
    var cells = arguments[0] !== (void 0) ? arguments[0] : [];
    this.cells = cells;
  };
  ($traceurRuntime.createClass)(TableRow, {addCell: function(cell) {
      this.cells.push(cell);
    }}, {});
  return {
    get TableRow() {
      return TableRow;
    },
    __esModule: true
  };
});

define("utils/colors", [], function() {
  "use strict";
  var __moduleName = "utils/colors";
  var Colors = function Colors() {};
  ($traceurRuntime.createClass)(Colors, {
    hexToRgb: function(hex) {
      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      if (!result) {
        throw Error('"' + hex + '" is not a valid hex color');
      }
      return {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      };
    },
    rgbToString: function(rgb) {
      var alpha = arguments[1] !== (void 0) ? arguments[1] : 1;
      return 'rgba(' + ([rgb.r, rgb.g, rgb.b, alpha].join(',')) + ')';
    },
    defaultScheme: function() {
      return ['#97bbcd', '#dcdcdc', '#F7464A', '#46BFBD', '#949FB1', '#FDB45C', '#4D5360', '#7cb5ec', '#90ed7d', '#f7a35c', '#8085e9', '#f15c80', '#e4d354', '#8085e8', '#8d4653', '#91e8e1'];
    }
  }, {});
  return {
    get Colors() {
      return Colors;
    },
    __esModule: true
  };
});

define("utils/maps", [], function() {
  "use strict";
  var __moduleName = "utils/maps";
  var Maps = function Maps() {};
  ($traceurRuntime.createClass)(Maps, {
    clone: function(map) {
      var newMap = new Map();
      map.forEach((function(value, key) {
        newMap.set(key, value);
      }));
      return newMap;
    },
    sum: function(map1, map2) {
      var newMap = new Map();
      map1.forEach((function(value, key) {
        newMap.set(key, value);
      }));
      map2.forEach((function(value, key) {
        newMap.set(key, value);
      }));
      return newMap;
    }
  }, {});
  return {
    get Maps() {
      return Maps;
    },
    __esModule: true
  };
});
