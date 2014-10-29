import {SegmentGraph} from 'result/graph/segmentGraph';

describe('SegmentGraph', function() {
    it('constructor', function() {
        let graph = new SegmentGraph('pie', ['mylabel']);
        expect(graph.labels).toEqual(['mylabel']);
        expect(graph.graphType).toEqual('pie');
    });
});
