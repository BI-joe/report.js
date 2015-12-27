import {TableRow} from '../../../src/js/result/table/tableRow';
import {TableCell} from '../../../src/js/result/table/tableCell';
import {ResultSetFactory} from '../../../src/js/input/resultSetFactory';
import {TableHeaderProcessor} from '../../../src/js/processor/table/tableHeaderProcessor';

describe('TableHeaderProcessor', function() {
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
            processor = new TableHeaderProcessor(['m1', 'm2'], ['measures', 'd']);

        let cell = new TableCell('m1', { colspan: 1, header: true }),
            cell2 = new TableCell('m2', { colspan: 2, header: true }),
            cell3 = new TableCell('d11', { colspan: 1, header: true }),
            cell4 = new TableCell('d11', { colspan: 1, header: true }),
            cell5 = new TableCell('d12', { colspan: 1, header: true }),
            headerCell = new TableCell('header', { header: true }),
            row = new TableRow([headerCell, cell, cell2]),
            row2 = new TableRow([headerCell, cell3, cell4, cell5]),
            expectedRows = [row, row2];

        expect(processor.process(resultSet, [headerCell])).toEqual(expectedRows);
    });
});
