import {Graph} from 'result/graph/graph';

describe('Graph', function() {
    it('constructor and add dataset', function() {
        let graph = new Graph('line', ['mylabel'], [{ label: 'toto', data: [2] }]);
        expect(graph.labels).toEqual(['mylabel']);
        expect(graph.graphType).toEqual('line');

        graph.addDataset({ label: 'tata', data: [3] });
        expect(graph.datasets).toEqual([{ label: 'toto', data: [2] }, { label: 'tata', data: [3] }]);
    });
});
