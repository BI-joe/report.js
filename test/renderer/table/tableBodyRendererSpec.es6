import {TableRow} from 'result/table/tableRow';
import {TableCell} from 'result/table/tableCell';
import {GridFactory} from 'data/gridFactory';
import {TableBodyRenderer} from 'renderer/table/tableBodyRenderer';

describe('TableBodyRenderer', function() {
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
            renderer = new TableBodyRenderer(['d2'],['d']);

        let cell = new TableCell('d21', { rowspan: 1 }),
            cell2 = new TableCell(10),
            cell3 = new TableCell(''),
            cell4 = new TableCell('d22', { rowspan: 1 }),
            cell5 = new TableCell(8),
            cell6 = new TableCell(5),
            row = new TableRow([cell, cell2, cell3]),
            row2 = new TableRow([cell4, cell5, cell6]),
            expectedRows = [row, row2];

        expect(renderer.render(grid)).toEqual(expectedRows);
    });

    it('render with rowspan', function() {
        let
            factory = new GridFactory(),
            gridData = {
                dimensions: [{ id: 'd'}, { id: 'd2' }, { id: 'd3' }],
                dimensionValues: [
                    [{ id: 'd11' }, { id: 'd12' }],
                    [{ id: 'd21' }, { id: 'd22' }],
                    [{ id: 'd31' }]
                ],
                cells: [
                    {value: 10, dimensionValues: [0, 0, 0]},
                    {value: 5, dimensionValues: [0, 1, 0]},
                    {value: 8, dimensionValues: [1, 0, 0]}
                ]
            },
            grid = factory.buildFromJson(gridData),
            renderer = new TableBodyRenderer(['d', 'd2'], ['d3']);

        let cell = new TableCell('d11', { rowspan: 2 }),
            cell2 = new TableCell('d21', { rowspan: 1 }),
            cell3 = new TableCell(10),
            cell4 = new TableCell('d22', { rowspan: 1 }),
            cell5 = new TableCell(5),
            cell6 = new TableCell('d12', { rowspan: 1 }),
            cell7 = new TableCell('d21', { rowspan: 1 }),
            cell8 = new TableCell(8),
            row = new TableRow([cell, cell2, cell3]),
            row2 = new TableRow([cell4, cell5]),
            row3 = new TableRow([cell6, cell7, cell8]),
            expectedRows = [row, row2, row3];

        expect(renderer.render(grid)).toEqual(expectedRows);
    });

    it('getHeaderCells', function() {
        let renderer = new TableBodyRenderer(['d1', 'd2'],['d']);
        expect(renderer.getHeaderCells()).toEqual([
            new TableCell('', {
                colspan: 2
            })
        ]);
    });
});
