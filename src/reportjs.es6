import {GridFactory} from 'data/gridFactory';
import {TableRenderer} from 'renderer/table/tableRenderer';
import {GraphRenderer} from 'renderer/graph/graphRenderer';
import {ChartjsAdapter} from 'adapter/chartjsAdapter';

export class Renderer {

    renderTo(element, options) {
        let gridFactory = new GridFactory(),
            grid = gridFactory.buildFromJson(options.data);

        if (options.layout.type === 'table') {
            let tableRenderer = new TableRenderer(options.layout.rows, options.layout.columns),
                table = tableRenderer.render(grid);
                element.html(table.getHtml());
        } else if (options.layout.type === 'graph') {
            let graphRenderer = new GraphRenderer(options.layout.datasets, options.layout.labels, options.layout.graphType),
                graph = graphRenderer.render(grid),
                adapter = new ChartjsAdapter();
            adapter.renderTo(element, graph);
        }
    }

}
