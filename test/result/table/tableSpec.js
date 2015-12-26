import {TableRow} from '../../../src/js/result/table/tableRow';
import {TableCell} from '../../../src/js/result/table/tableCell';
import {Table} from '../../../src/js/result/table/table';

describe('Table', function() {
    it('constructor and add row', function() {
        let cell = new TableCell(10, { colspan: 2 }),
            row = new TableRow([cell]),
            table = new Table();
        table.addRow(row);
        expect(table.rows).toEqual([row]);
    });

    it('getHtml', function() {
        let headerCell = new TableCell('', { colspan: 1, header: true}),
            headerCell2 = new TableCell('d11', { colspan: 1}),
            headerCell3 = new TableCell('d12', { colspan: 1}),
            cell = new TableCell('d21', { rowspan: 1 }),
            cell2 = new TableCell(10),
            cell3 = new TableCell(''),
            cell4 = new TableCell('d22', { rowspan: 1 }),
            cell5 = new TableCell(8),
            cell6 = new TableCell(5),
            headerRow = new TableRow([headerCell, headerCell2, headerCell3]),
            row = new TableRow([cell, cell2, cell3]),
            row2 = new TableRow([cell4, cell5, cell6]),
            rows = [headerRow, row, row2],
            table = new Table(rows);

        expect(table.getHtml()).toEqual('<table><tr><th></th><td>d11</td><td>d12</td></tr><tr><td>d21</td><td>10</td><td></td></tr><tr><td>d22</td><td>8</td><td>5</td></tr></table>');
    });
});
