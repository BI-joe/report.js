import {TableRow} from '../../../src/js/result/table/tableRow';
import {TableCell} from '../../../src/js/result/table/tableCell';
import {ResultSetFactory} from '../../../src/js/input/resultSetFactory';
import {TableBodyProcessor} from '../../../src/js/processor/table/tableBodyProcessor';

describe('TableBodyProcessor', function() {
    it('process', function() {
        let
            factory = new ResultSetFactory(),
            data = {
                fields: ['d', 'm1', 'm2'],
                rows: [
                    ['d11', 10, 8],
                    ['d12', null, 5]
                ]
            },
            resultSet = factory.buildFromJson(data),
            processor = new TableBodyProcessor(['m1', 'm2'], ['measures'], ['d']);

        let cell = new TableCell('m1', { rowspan: 1, header: true }),
            cell2 = new TableCell(10),
            cell3 = new TableCell(null),
            cell4 = new TableCell('m2', { rowspan: 1, header: true }),
            cell5 = new TableCell(8),
            cell6 = new TableCell(5),
            row = new TableRow([cell, cell2, cell3]),
            row2 = new TableRow([cell4, cell5, cell6]),
            expectedRows = [row, row2];

        expect(processor.process(resultSet)).toEqual(expectedRows);
    });

    it('process with rowspan', function() {
        let
            factory = new ResultSetFactory(),
            data = {
                fields: ['d', 'd3', 'm1', 'm2'],
                rows: [
                    ['d11', 'd31', 10, 8],
                    ['d12', 'd31', null, 5]
                ]
            },
            resultSet = factory.buildFromJson(data),
            processor = new TableBodyProcessor(['m1', 'm2'], ['d', 'measures'], ['d3']);

        let cell = new TableCell('d11', { rowspan: 2, header: true }),
            cell2 = new TableCell('m1', { rowspan: 1, header: true }),
            cell3 = new TableCell(10),
            cell4 = new TableCell('m2', { rowspan: 1, header: true }),
            cell5 = new TableCell(8),
            cell6 = new TableCell('d12', { rowspan: 1, header: true }),
            cell8 = new TableCell(5),
            row = new TableRow([cell, cell2, cell3]),
            row2 = new TableRow([cell4, cell5]),
            row3 = new TableRow([cell6, cell4, cell8]),
            expectedRows = [row, row2, row3];

        expect(processor.process(resultSet)).toEqual(expectedRows);
    });

    it('getHeaderCells', function() {
        let processor = new TableBodyProcessor(['m1', 'm2'], ['d1', 'measures'], ['d']);
        expect(processor.getHeaderCells()).toEqual([
            new TableCell('', {
                colspan: 2,
                header: true
            })
        ]);
    });
});
