import {TableRow} from 'output/table/tableRow';
import {TableCell} from 'output/table/tableCell';
import {Table} from 'output/table/table';

describe('Table', function() {
    it('constructor and add row', function() {
        let cell = new TableCell(10, { colspan: 2 }),
            row = new TableRow([cell]),
            table = new Table();
        table.addRow(row);
        expect(table.rows).toEqual([row]);
    });
});
