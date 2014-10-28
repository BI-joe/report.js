import {TableRow}  from 'result/table/tableRow';
import {TableCell} from 'result/table/tableCell';
import {Maps}      from 'utils/maps';

export class TableBodyRenderer {

    constructor(rowDimensions, columnDimensions) {
        this.rowDimensions = rowDimensions;
        this.columnDimensions = columnDimensions;
    }

    render(grid) {

        let mapUtils = new Maps(),

            getBodyCells = function(currentRow, columnDimensions, cells, dimensionValues) {
                let colSets = grid.getDimenionValuesSets(_.map(columnDimensions, dimension => grid.getDimension(dimension)));

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

                let currentDimensionId     = _.first(rowDimensions),
                    currentDimension       = grid.getDimension(currentDimensionId),
                    remainingDimensions    = _.without(rowDimensions, currentDimensionId),
                    countCells             = 0,
                    first                  = true;

                grid.getDimensionValues(currentDimension).forEach(dimensionValue => {

                    let subCells = _.filter(cells, cell => cell.getDimensionValue(currentDimension) === dimensionValue);
                    if (subCells.length) {
                        let currentRow = row;
                        if (row === null || !first) {
                            currentRow = new TableRow();
                            rows.push(currentRow);
                        }
                        first = false;
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

    getHeaderCells() {
        return [
            new TableCell('', {
                colspan: this.rowDimensions.length
            })
        ];
    }
}
