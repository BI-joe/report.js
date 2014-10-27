import {TableRow}  from 'result/table/tableRow';
import {TableCell} from 'result/table/tableCell';
import {Maps}      from 'utils/maps';

export class TableHeaderRenderer {

    constructor(columnDimensions) {
        this.columnDimensions = columnDimensions;
    }

    render(grid, headerCells = []) {

        let mapUtils = new Maps(),
            getHeaderRows = function(rows, dimensions, cells, dimensionValues = new Map()) {
                if (dimensions.length === 0) {
                    return 1;
                }

                let currentDimensionId     = _.first(dimensions),
                    currentDimension       = grid.getDimension(currentDimensionId),
                    remainingDimensions    = _.without(dimensions, currentDimensionId),
                    countCells             = 0,
                    currentRow;
                if (rows.has(currentDimensionId)) {
                    currentRow = rows.get(currentDimensionId);
                } else {
                    currentRow = new TableRow();
                    rows.set(currentDimensionId, currentRow);
                }
                grid.getDimensionValues(currentDimension).forEach(function(dimensionValue) {
                    let subCells = _.filter(cells, function(cell) {
                        return cell.getDimensionValue(currentDimension) === dimensionValue;
                    });
                    if (subCells.length) {
                        let currentDimensionValues = mapUtils.clone(dimensionValues);
                        currentDimensionValues.set(currentDimensionId, dimensionValue);
                        let childCellsCount = getHeaderRows(rows, remainingDimensions, subCells, currentDimensionValues);

                        currentRow.addCell(new TableCell(dimensionValue.caption, {
                            colspan: childCellsCount
                        }));

                        countCells += childCellsCount;
                    }
                });

                return countCells;
            };

        let rowsMap = new Map();
        if (this.columnDimensions.length === 0) {
            return headerCells.concat([new TableRow([ new TableCell('') ])]);
        } else {
            getHeaderRows(rowsMap, this.columnDimensions, grid.cells);
            let rows = [];
            rowsMap.forEach(function(row) {
                row.cells = headerCells.concat(row.cells);
                rows.push(row);
            });
            return rows;
        }
    }
}
