import {Graph} from '../../../src/js/result/graph/graph';
import {ResultSetFactory} from '../../../src/js/input/resultSetFactory';
import {GraphProcessor} from '../../../src/js/processor/graph/graphProcessor';

describe('GraphProcessor', function() {
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
            processor = new GraphProcessor(['m1', 'm2'], ['measures'], ['d']);

        let expectedGraph = new Graph('line', ['d11', 'd12'], [{ label: 'm1', data: [10, null] }, { label: 'm2', data: [8, 5] }]);

        expect(processor.process(resultSet)).toEqual(expectedGraph);
    });
});
