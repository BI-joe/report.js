import {Table} from '../output/table/table';

export class TableRenderer {

    constructor(rowDimensions, columnDimensions) {
        this.rowDimensions    = rowDimensions;
        this.columnDimensions = columnDimensions;
    }

    render(grid) {
        let table = new Table();

        return table;
    }
}
