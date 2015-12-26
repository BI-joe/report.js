import {TableRow} from '../../../src/js/result/table/tableRow';
import {TableCell} from '../../../src/js/result/table/tableCell';
import {GridFactory} from '../../../src/js/data/gridFactory';
import {TableHeaderRenderer} from '../../../src/js/renderer/table/tableHeaderRenderer';

describe('TableHeaderRenderer', function() {
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
            renderer = new TableHeaderRenderer(['d2', 'd']);

        let cell = new TableCell('d21', { colspan: 1, header: true }),
            cell2 = new TableCell('d22', { colspan: 2, header: true }),
            cell3 = new TableCell('d11', { colspan: 1, header: true }),
            cell4 = new TableCell('d11', { colspan: 1, header: true }),
            cell5 = new TableCell('d12', { colspan: 1, header: true }),
            headerCell = new TableCell('header', { header: true }),
            row = new TableRow([headerCell, cell, cell2]),
            row2 = new TableRow([headerCell, cell3, cell4, cell5]),
            expectedRows = [row, row2];

        expect(renderer.render(grid, [headerCell])).toEqual(expectedRows);
    });
});
