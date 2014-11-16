import {TableRow}  from '../../result/table/tableRow';
import {TableCell} from '../../result/table/tableCell';
import {Maps}      from '../../utils/maps';

export class TableBodyRenderer {

    constructor(rowDimensions, columnDimensions, options = {}) {
        this.rowDimensions = rowDimensions;
        this.columnDimensions = columnDimensions;
        this.options = options;
    }

    render(grid) {
        let mapUtils = new Maps(),

            getBodyCells = function(currentRow, columnDimensions, cells, dimensionValues) {
                let colSets = grid.getDimenionValuesSets(columnDimensions.map(dimension => grid.getDimension(dimension)));

                colSets.forEach(set => {
                    let cellSet = mapUtils.sum(dimensionValues, set);
                    let cell = grid.getCell(cellSet);
                    if (cell) {
                        currentRow.addCell(new TableCell(cell.value));
                    } else {
                        currentRow.addCell(new TableCell(''));
                    }
                });
            },

            getRows = function(rows, rowDimensions, columnDimensions, cells, dimensionValues = new Map(), row = null) {
                if (rowDimensions.length === 0) {
                    getBodyCells(row, columnDimensions, cells, dimensionValues);
                    return 1;
                }

                let currentDimensionId     = rowDimensions[0],
                    currentDimension       = grid.getDimension(currentDimensionId),
                    remainingDimensions    = rowDimensions.slice(1),
                    countCells             = 0,
                    first                  = true;

                grid.getDimensionValues(currentDimension).forEach(dimensionValue => {

                    let subCells = cells.filter(cell => cell.getDimensionValue(currentDimension) === dimensionValue);
                    if (subCells.length) {
                        let currentRow = row;
                        if (row === null || !first) {
                            currentRow = new TableRow();
                            rows.push(currentRow);
                        }
                        first = false;
                        let currentDimensionValues = mapUtils.clone(dimensionValues);

                        currentDimensionValues.set(currentDimensionId, dimensionValue);
                        let tableCell;
                        if (!this.options.hideHeaders) {
                            tableCell = new TableCell(dimensionValue.caption, { header: true });
                            currentRow.addCell(tableCell);
                        }
                        let childCellsCount = getRows.call(this, rows, remainingDimensions, columnDimensions, subCells, currentDimensionValues, currentRow);
                        if (!this.options.hideHeaders) {
                            tableCell.setOption('rowspan', childCellsCount);
                        }
                        countCells += childCellsCount;
                    }
                }, this);

            return countCells;
        };

        let rows = [];
        getRows.call(this, rows, this.rowDimensions, this.columnDimensions, grid.cells);

        return rows;
    }

    getHeaderCells() {
        if (this.options.hideHeaders) {
            return [];
        }
        return [
            new TableCell('', {
                colspan: this.rowDimensions.length,
                header: true
            })
        ];

    }
}
