import {GridFactory} from '../data/gridFactory';
import {TableRenderer} from './table/tableRenderer';
import {GraphRenderer} from './graph/graphRenderer';
import {SegmentGraphRenderer} from './graph/segmentGraphRenderer';

export class Renderer {

    render(options) {
        let gridFactory = new GridFactory(),
            grid = gridFactory.buildFromJson(options.data),
            output;

        switch (options.layout.type) {
            case 'table':
                let tableRenderer = new TableRenderer(options.layout.rows, options.layout.columns, options.layout.options);
                output = tableRenderer.render(grid);
                break;
            case 'graph':
                let graphRenderer = new GraphRenderer(options.layout.datasets, options.layout.labels, options.layout.graphType, options.layout.height, options.layout.width);
                output = graphRenderer.render(grid);
                break;
            case 'segmentGraph':
                let segmentGraphRenderer = new SegmentGraphRenderer(options.layout.graphType, options.layout.height, options.layout.width);
                output = segmentGraphRenderer.render(grid);
                break;
            default:
                throw Error('unknown layout type');
        }

        return output;
    }

}
