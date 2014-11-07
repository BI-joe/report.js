import {Graph} from '../../../src/result/graph/graph';
import {GridFactory} from '../../../src/data/gridFactory';
import {GraphRenderer} from '../../../src/renderer/graph/graphRenderer';

describe('GraphRenderer', function() {
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
            renderer = new GraphRenderer(['d2'],['d']);

        let expectedGraph = new Graph('line', ['d11', 'd12'], [{ label: 'd21', data: [10, null] }, { label: 'd22', data: [8, 5] }]);

        expect(renderer.render(grid)).toEqual(expectedGraph);
    });
});
