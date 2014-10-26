import {TableRow} from 'output/table/tableRow';
import {TableCell} from 'output/table/tableCell';

describe('TableRow', function() {
    it('constructor', function() {
        let cell = new TableCell(10, { colspan: 2 }),
            row = new TableRow([cell]);
        expect(row.cells).toEqual([cell]);
    });
});
