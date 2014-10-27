import {TableRow} from 'result/table/tableRow';
import {TableCell} from 'result/table/tableCell';

describe('TableRow', function() {
    it('constructor', function() {
        let cell = new TableCell(10, { colspan: 2 }),
            row = new TableRow([cell]);
        expect(row.cells).toEqual([cell]);
    });
});
