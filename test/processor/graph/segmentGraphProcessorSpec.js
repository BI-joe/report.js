import {SegmentGraph} from '../../../src/js/result/graph/segmentGraph';
import {ResultSetFactory} from '../../../src/js/input/resultSetFactory';
import {SegmentGraphProcessor} from '../../../src/js/processor/graph/segmentGraphProcessor';

describe('SegmentGraphProcessor', function() {
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
            processor = new SegmentGraphProcessor(['m1', 'm2']);

        let expectedGraph = new SegmentGraph('pie', [{ label: 'm1 - d11', value: 10 }, { label: 'm2 - d11', value: 8 }, { label: 'm2 - d12', value: 5 }]);

        expect(processor.process(resultSet)).toEqual(expectedGraph);
    });
});
