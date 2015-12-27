import {TableRow} from '../../../src/js/result/table/tableRow';
import {TableCell} from '../../../src/js/result/table/tableCell';
import {Table} from '../../../src/js/result/table/table';
import {ResultSetFactory} from '../../../src/js/input/resultSetFactory';
import {TableProcessor} from '../../../src/js/processor/table/tableProcessor';

describe('TableProcessor', function() {
    it('process', function() {
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
            processor = new TableProcessor(['m1', 'm2'], ['measures'], ['d']);

        let
            headerCell = new TableCell('', { colspan: 1, header: true}),
            headerCell2 = new TableCell('d11', { colspan: 1, header: true}),
            headerCell3 = new TableCell('d12', { colspan: 1, header: true}),
            cell = new TableCell('m1', { header: true, rowspan: 1 }),
            cell2 = new TableCell(10),
            cell3 = new TableCell(null),
            cell4 = new TableCell('m2', { header: true, rowspan: 1 }),
            cell5 = new TableCell(8),
            cell6 = new TableCell(5),
            headerRow = new TableRow([headerCell, headerCell2, headerCell3]),
            row = new TableRow([cell, cell2, cell3]),
            row2 = new TableRow([cell4, cell5, cell6]),
            rows = [headerRow, row, row2],
            expectedTable = new Table(rows);

        expect(processor.process(resultSet)).toEqual(expectedTable);
    });

    it('process without col header', function() {
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
            processor = new TableProcessor(['m1', 'm2'], ['measures'], ['d'], {hideColumnHeaders: true});

        let
            cell = new TableCell('m1', { header: true, rowspan: 1 }),
            cell2 = new TableCell(10),
            cell3 = new TableCell(null),
            cell4 = new TableCell('m2', { header: true, rowspan: 1 }),
            cell5 = new TableCell(8),
            cell6 = new TableCell(5),
            row = new TableRow([cell, cell2, cell3]),
            row2 = new TableRow([cell4, cell5, cell6]),
            rows = [row, row2],
            expectedTable = new Table(rows);

        expect(processor.process(resultSet)).toEqual(expectedTable);
    });

    it('process whithout row header', function() {
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
            processor = new TableProcessor(['m1', 'm2'], ['measures'], ['d'], {hideRowHeaders: true});

        let
            headerCell2 = new TableCell('d11', { colspan: 1, header: true}),
            headerCell3 = new TableCell('d12', { colspan: 1, header: true}),
            cell2 = new TableCell(10),
            cell3 = new TableCell(null),
            cell5 = new TableCell(8),
            cell6 = new TableCell(5),
            headerRow = new TableRow([headerCell2, headerCell3]),
            row = new TableRow([cell2, cell3]),
            row2 = new TableRow([cell5, cell6]),
            rows = [headerRow, row, row2],
            expectedTable = new Table(rows);

        expect(processor.process(resultSet)).toEqual(expectedTable);
    });
});
