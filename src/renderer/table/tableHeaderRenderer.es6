import {Table}     from '../output/table/table';
import {TableRow}  from '../output/table/tableRow';
import {TableCell} from '../output/table/tableCell';

export class TableHeaderRenderer {

    constructor(columnDimensions) {
        this.columnDimensions = columnDimensions;
    }

    render(grid) {

        let getHeaderRows = function(rows, dimensions, cells, dimensionValues = new Map()) {
            if (dimensions.length === 0) {
                return 1;
            }

            let currentDimensionId     = _.first(dimensions),
                currentDimension       = grid.getDimension(currentDimensionId),
                remainingDimensions    = _.pull(dimensions, currentDimensionId),
                countCells             = 0,
                currentRow             = new TableRow();
            rows.set(currentDimensionId, currentRow);
            grid.getDimensionValues(currentDimension).forEach(function(dimensionValue) {
                let subCells = _.filter(cells, function(cell) {
                        return cell.getDimensionValue(currentDimension) === dimensionValue;
                    });
                if (subCells.length) {
                    let currentDimensionValues = _.clone(dimensionValues);
                    currentDimensionValues.set(currentDimensionId, dimensionValue);
                    let childCellsCount = getHeaderRows(rows, remainingDimensions, subCells, currentDimensionValues);

                    currentRow.addCell(new TableCell(dimensionValue.caption, {
                        colspan: childCellsCount
                    }));

                    countCells += childCellsCount;
                }
            });
        };

        let table = new Table(),
            rows = [];
        if (this.columnDimensions.length === 0) {
            table.addRow(new TableRow([ new TableCell('') ]));
        } else {
            getHeaderRows(rows, this.columnDimensions, grid.cells);
            rows.forEach(function(row) {
                table.addRow(row);
            });
        }

        return table;
    }
}
