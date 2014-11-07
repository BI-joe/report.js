import {SegmentGraph} from '../../../src/result/graph/segmentGraph';
import {GridFactory} from '../../../src/data/gridFactory';
import {SegmentGraphRenderer} from '../../../src/renderer/graph/segmentGraphRenderer';

describe('SegmentGraphRenderer', function() {
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
            renderer = new SegmentGraphRenderer();

        let expectedGraph = new SegmentGraph('pie', [{ label: 'd11 - d21', value: 10 }, { label: 'd12 - d22', value: 5 }, { label: 'd11 - d22', value: 8 }]);

        expect(renderer.render(grid)).toEqual(expectedGraph);
    });
});
