import {ResultSetFactory} from '../input/resultSetFactory';
import {TableProcessor} from './table/tableProcessor';
import {GraphProcessor} from './graph/graphProcessor';
import {SegmentGraphProcessor} from './graph/segmentGraphProcessor';

export class Processor {

    process(options) {
        const resultSetFactory = new ResultSetFactory(),
            resultSet = resultSetFactory.buildFromJson(options.data);

        switch (options.layout.type) {
            case 'table':
                let processor = new TableProcessor(options.layout.measures, options.layout.rows, options.layout.columns, options.layout.options);
                return processor.process(resultSet);
            case 'graph':
                let graphProcessor = new GraphProcessor(options.layout.measures, options.layout.datasets, options.layout.labels, options.layout.graphType, options.layout.height, options.layout.width, options.layout.options);
                return graphProcessor.process(resultSet);
            case 'segmentGraph':
                let segmentGraphProcessor = new SegmentGraphProcessor(options.layout.measures, options.layout.graphType, options.layout.height, options.layout.width);
                return segmentGraphProcessor.process(resultSet);
            default:
                throw Error('unknown layout type');
        }
    }

}
