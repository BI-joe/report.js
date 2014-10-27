import {TableRow}  from 'output/table/tableRow';
import {TableCell} from 'output/table/tableCell';
import {Maps}      from 'utils/maps';

export class TableBodyRenderer {

    constructor(rowDimensions, columnDimensions) {
        this.rowDimensions = rowDimensions;
        this.columnDimensions = columnDimensions;
    }

    render(grid) {

        let mapUtils = new Maps(),
            
            getBodyCells = function(currentRow, columnDimensions, cells, dimensionValues) {
                let colSets = grid.getDimenionValuesSets(_.map(columnDimensions, function(dimension) {
                    return grid.getDimension(dimension);
                }));

                colSets.forEach(function(set) {
                    let cellSet = mapUtils.sum(dimensionValues, set);
                    let cell = grid.getCell(cellSet);
                    if (cell) {
                        currentRow.addCell(new TableCell(cell.value));
                    } else {
                        currentRow.addCell(new TableCell(''));
                    }
                });
            },

            getRows = function(rows, rowDimensions, columnDimensions, cells, dimensionValues = new Map(), currentRow = null) {
                if (rowDimensions.length === 0) {
                    getBodyCells(currentRow, columnDimensions, cells, dimensionValues);
                    return 1;
                }

                let currentDimensionId     = _.first(rowDimensions),
                    currentDimension       = grid.getDimension(currentDimensionId),
                    remainingDimensions    = _.without(rowDimensions, currentDimensionId),
                    countCells             = 0,
                    first                  = true;

                grid.getDimensionValues(currentDimension).forEach(function(dimensionValue) {

                    let subCells = _.filter(cells, function(cell) {
                        return cell.getDimensionValue(currentDimension) === dimensionValue;
                    });
                    if (subCells.length) {
                        if (currentRow === null || !first) {
                            currentRow = new TableRow();
                            rows.push(currentRow);
                            first = false;
                        }
                        let currentDimensionValues = mapUtils.clone(dimensionValues);

                        currentDimensionValues.set(currentDimensionId, dimensionValue);
                        let tableCell = new TableCell(dimensionValue.caption);
                        currentRow.addCell(tableCell);
                        let childCellsCount = getRows(rows, remainingDimensions, columnDimensions, subCells, currentDimensionValues, currentRow);
                        tableCell.setOption('rowspan', childCellsCount);
                        countCells += childCellsCount;
                    }
                });

            return countCells;
        };

        let rows = [];
        getRows(rows, this.rowDimensions, this.columnDimensions, grid.cells);

        return rows;
    }
}
