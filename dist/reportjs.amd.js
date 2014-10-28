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

define("data/grid", ['utils/maps'], function($__0) {
  "use strict";
  var __moduleName = "data/grid";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  var Maps = $__0.Maps;
  var Grid = function Grid(dimensions, dimensionValues, cells) {
    this.cells = cells;
    this.dimensions = dimensions;
    this.dimensionValues = dimensionValues;
  };
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
            var $__2 = this;
            if (dimensions.length === 0) {
              sets.push(set);
              return;
            }
            var currentDimension = _.first(dimensions),
                remainingDimensions = _.without(dimensions, currentDimension);
            this.getDimensionValues(currentDimension).forEach((function(dimensionValue) {
              var currentSet$__4;
              var subCells = _.filter(cells, (function(cell) {
                return cell.getDimensionValue(currentDimension) === dimensionValue;
              }));
              if (subCells.length) {
                currentSet$__4 = mapUtils.clone(set);
                currentSet$__4.set(currentDimension.id, dimensionValue);
                getSets.call($__2, sets, remainingDimensions, subCells, currentSet$__4);
              }
            }), this);
          };
      var sets = [];
      getSets.call(this, sets, dimensions, this.cells);
      return sets;
    },
    getCell: function(dimensionValues) {
      var $__2 = this;
      return this.cells.find((function(cell) {
        var found = true;
        dimensionValues.forEach((function(dimensionValue, dimensionId) {
          if (dimensionValue.id !== cell.getDimensionValue($__2.getDimension(dimensionId)).id) {
            found = false;
          }
        }), $__2);
        return found;
      }), this);
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

define("output/outputHtml", [], function() {
  "use strict";
  var __moduleName = "output/outputHtml";
  var OutputHtml = function OutputHtml() {};
  ($traceurRuntime.createClass)(OutputHtml, {getHtml: function(result) {
      var getHtmlForTable = function(table) {
        var html = '';
        table.rows.forEach((function(row) {
          var rowHtml = '';
          row.cells.forEach((function(cell) {
            var cellAttributes = [];
            if (cell.options.rowspan !== undefined && cell.options.rowspan > 1) {
              cellAttributes.push('rowspan="' + cell.options.rowspan + '"');
            }
            if (cell.options.colspan !== undefined && cell.options.colspan > 1) {
              cellAttributes.push('colspan="' + cell.options.colspan + '"');
            }
            rowHtml += '<td' + (cellAttributes.length ? ' ' + cellAttributes.join(' ') : '') + '>' + cell.value + '</td>';
          }));
          rowHtml = '<tr>' + rowHtml + '</tr>';
          html += rowHtml;
        }));
        return '<table>' + html + '</table>';
      },
          htmls = [];
      result.results.forEach((function(table) {
        htmls.push(getHtmlForTable(table));
      }));
      return htmls.join();
    }}, {});
  return {
    get OutputHtml() {
      return OutputHtml;
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
            var colSets = grid.getDimenionValuesSets(_.map(columnDimensions, (function(dimension) {
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
            var currentDimensionId = _.first(rowDimensions),
                currentDimension = grid.getDimension(currentDimensionId),
                remainingDimensions = _.without(rowDimensions, currentDimensionId),
                countCells = 0,
                first = true;
            grid.getDimensionValues(currentDimension).forEach((function(dimensionValue) {
              var currentRow$__7;
              var currentDimensionValues$__8;
              var tableCell$__9;
              var childCellsCount$__10;
              var subCells = _.filter(cells, (function(cell) {
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
                tableCell$__9 = new TableCell(dimensionValue.caption);
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
      return [new TableCell('', {colspan: this.rowDimensions.length})];
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
            var currentDimensionId = _.first(dimensions),
                currentDimension = grid.getDimension(currentDimensionId),
                remainingDimensions = _.without(dimensions, currentDimensionId),
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
              var subCells = _.filter(cells, (function(cell) {
                return cell.getDimensionValue(currentDimension) === dimensionValue;
              }));
              if (subCells.length) {
                currentDimensionValues$__7 = mapUtils.clone(dimensionValues);
                currentDimensionValues$__7.set(currentDimensionId, dimensionValue);
                childCellsCount$__8 = getHeaderRows(rows, remainingDimensions, subCells, currentDimensionValues$__7);
                currentRow.addCell(new TableCell(dimensionValue.caption, {colspan: childCellsCount$__8}));
                countCells += childCellsCount$__8;
              }
            }));
            return countCells;
          };
      var rowsMap = new Map();
      if (this.columnDimensions.length === 0) {
        return headerCells.concat([new TableRow([new TableCell('')])]);
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

define("reportjs", ['data/gridFactory', 'renderer/table/tableRenderer', 'output/outputHtml', 'result/result'], function($__0,$__2,$__4,$__6) {
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
  var GridFactory = $__0.GridFactory;
  var TableRenderer = $__2.TableRenderer;
  var OutputHtml = $__4.OutputHtml;
  var Result = $__6.Result;
  var Renderer = function Renderer() {};
  ($traceurRuntime.createClass)(Renderer, {render: function(options) {
      var gridFactory = new GridFactory(),
          grid = gridFactory.buildFromJson(options.data);
      var tableRenderer = new TableRenderer(options.rows, options.columns),
          table = tableRenderer.render(grid),
          result = new Result();
      result.addResult(table);
      var outputHtml = new OutputHtml();
      return outputHtml.getHtml(result);
    }}, {});
  return {
    get Renderer() {
      return Renderer;
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
  ($traceurRuntime.createClass)(Table, {addRow: function(row) {
      this.rows.push(row);
    }}, {});
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
