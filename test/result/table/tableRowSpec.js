import {TableRow} from '../../../src/result/table/tableRow';
import {TableCell} from '../../../src/result/table/tableCell';

describe('TableRow', function() {
    it('constructor', function() {
        let cell = new TableCell(10, { colspan: 2 }),
            row = new TableRow([cell]);
        expect(row.cells).toEqual([cell]);
    });
});
