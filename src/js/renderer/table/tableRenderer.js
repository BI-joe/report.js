import {Table} from '../../result/table/table';
import {TableHeaderRenderer} from '../../renderer/table/tableHeaderRenderer';
import {TableBodyRenderer} from '../../renderer/table/tableBodyRenderer';

export class TableRenderer {

    constructor(rowDimensions, columnDimensions, options = {}) {
        this.rowDimensions    = rowDimensions;
        this.columnDimensions = columnDimensions;
        this.options = options;
    }

    render(grid) {
        let table = new Table(),
            tableHeaderRenderer = new TableHeaderRenderer(this.columnDimensions, {
                hideHeaders: this.options.hideColumnHeaders
            }),
            tableBodyRenderer = new TableBodyRenderer(this.rowDimensions, this.columnDimensions, {
                hideHeaders: this.options.hideRowHeaders
            }),

            headerRows = tableHeaderRenderer.render(grid, tableBodyRenderer.getHeaderCells()),
            bodyRows = tableBodyRenderer.render(grid);

        headerRows.forEach(row => { table.addRow(row); });
        bodyRows.forEach(row => { table.addRow(row); });

        return table;
    }
}
