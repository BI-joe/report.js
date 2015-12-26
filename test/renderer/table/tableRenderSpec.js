import {TableRow} from '../../../src/js/result/table/tableRow';
import {TableCell} from '../../../src/js/result/table/tableCell';
import {Table} from '../../../src/js/result/table/table';
import {GridFactory} from '../../../src/js/data/gridFactory';
import {TableRenderer} from '../../../src/js/renderer/table/tableRenderer';

describe('TableRenderer', function() {
    it('render', function() {
        let
            factory = new GridFactory(),
            gridData = {
                dimensions: [{ id: 'd'}, { id: 'd2' }],
                dimensionValues: [
                    [{ id: 'd11' }, { id: 'd12' }],
                    [{ id: 'd21' }, { id: 'd22' }]
                ],
                cells: [
                    {value: 10, dimensionValues: [0, 0]},
                    {value: 5, dimensionValues: [1, 1]},
                    {value: 8, dimensionValues: [0, 1]}
                ]
            },
            grid = factory.buildFromJson(gridData),
            renderer = new TableRenderer(['d2'],['d']);

        let
            headerCell = new TableCell('', { colspan: 1, header: true}),
            headerCell2 = new TableCell('d11', { colspan: 1, header: true}),
            headerCell3 = new TableCell('d12', { colspan: 1, header: true}),
            cell = new TableCell('d21', { rowspan: 1, header: true }),
            cell2 = new TableCell(10),
            cell3 = new TableCell(''),
            cell4 = new TableCell('d22', { rowspan: 1, header: true }),
            cell5 = new TableCell(8),
            cell6 = new TableCell(5),
            headerRow = new TableRow([headerCell, headerCell2, headerCell3]),
            row = new TableRow([cell, cell2, cell3]),
            row2 = new TableRow([cell4, cell5, cell6]),
            rows = [headerRow, row, row2],
            expectedTable = new Table(rows);

        expect(renderer.render(grid)).toEqual(expectedTable);
    });

    it('render without col header', function() {
        let
            factory = new GridFactory(),
            gridData = {
                dimensions: [{ id: 'd'}, { id: 'd2' }],
                dimensionValues: [
                    [{ id: 'd11' }, { id: 'd12' }],
                    [{ id: 'd21' }, { id: 'd22' }]
                ],
                cells: [
                    {value: 10, dimensionValues: [0, 0]},
                    {value: 5, dimensionValues: [1, 1]},
                    {value: 8, dimensionValues: [0, 1]}
                ]
            },
            grid = factory.buildFromJson(gridData),
            renderer = new TableRenderer(['d2'],['d'], {hideColumnHeaders: true});

        let
            cell = new TableCell('d21', { rowspan: 1, header: true }),
            cell2 = new TableCell(10),
            cell3 = new TableCell(''),
            cell4 = new TableCell('d22', { rowspan: 1, header: true }),
            cell5 = new TableCell(8),
            cell6 = new TableCell(5),
            row = new TableRow([cell, cell2, cell3]),
            row2 = new TableRow([cell4, cell5, cell6]),
            rows = [row, row2],
            expectedTable = new Table(rows);

        expect(renderer.render(grid)).toEqual(expectedTable);
    });

    it('render whithout row header', function() {
        let
            factory = new GridFactory(),
            gridData = {
                dimensions: [{ id: 'd'}, { id: 'd2' }],
                dimensionValues: [
                    [{ id: 'd11' }, { id: 'd12' }],
                    [{ id: 'd21' }, { id: 'd22' }]
                ],
                cells: [
                    {value: 10, dimensionValues: [0, 0]},
                    {value: 5, dimensionValues: [1, 1]},
                    {value: 8, dimensionValues: [0, 1]}
                ]
            },
            grid = factory.buildFromJson(gridData),
            renderer = new TableRenderer(['d2'],['d'], {hideRowHeaders: true});

        let
            headerCell2 = new TableCell('d11', { colspan: 1, header: true}),
            headerCell3 = new TableCell('d12', { colspan: 1, header: true}),
            cell2 = new TableCell(10),
            cell3 = new TableCell(''),
            cell5 = new TableCell(8),
            cell6 = new TableCell(5),
            headerRow = new TableRow([headerCell2, headerCell3]),
            row = new TableRow([cell2, cell3]),
            row2 = new TableRow([cell5, cell6]),
            rows = [headerRow, row, row2],
            expectedTable = new Table(rows);

        expect(renderer.render(grid)).toEqual(expectedTable);
    });
});
