import {Table} from '../result/table/table';
import {Graph} from '../result/graph/graph';
import {SegmentGraph} from '../result/graph/segmentGraph';

import {DOMTableAdapter} from './DOMTableAdapter';
import {DOMGraphChartjsAdapter} from './DOMGraphChartjsAdapter';

export class DOMAdapter {
    constructor() {
        this.tableAdapter = new DOMTableAdapter();
        this.graphAdapter = new DOMGraphChartjsAdapter();
    }

    renderTo(domElement, output) {
        if (output instanceof Table) {
            this.tableAdapter.renderTableTo(domElement, output);
        } else if (output instanceof Graph) {
            this.graphAdapter.renderGraphTo(domElement, output);
        } else if (output instanceof SegmentGraph) {
            this.graphAdapter.renderSegmentGraphTo(domElement, output);
        } else {
            throw 'This adapter can\'t render this kind of outputs';
        }
    }
}
