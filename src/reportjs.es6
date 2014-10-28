import {GridFactory} from 'data/gridFactory';
import {TableRenderer} from 'renderer/table/tableRenderer';
import {GraphRenderer} from 'renderer/graph/graphRenderer';

export class Renderer {

    renderTo(element, options) {
        let gridFactory = new GridFactory(),
            grid = gridFactory.buildFromJson(options.data);

        if (options.layout.type === 'table') {
            let tableRenderer = new TableRenderer(options.layout.rows, options.layout.columns),
                table = tableRenderer.render(grid);
                element.html(table.getHtml());
        } else if (options.layout.type === 'graph') {
            let graphRenderer = new GraphRenderer(options.layout.datasets, options.layout.labels),
                graph = graphRenderer.render(grid);
            element.prepend('<canvas width="'+element.width()+'" height="400"></canvas>');
            let context = element.find('canvas:first').get(0).getContext('2d'),
                chart = new Chart(context);

            chart.Line({
                labels: graph.labels,
                datasets: graph.datasets.map(dataset => {
                    dataset.fillColor = 'rgba(151,187,205,0.2)';
                    dataset.strokeColor = 'rgba(151,187,205,1)';
                    dataset.pointColor = 'rgba(151,187,205,1)';
                    dataset.pointStrokeColor = '#fff';
                    dataset.pointHighlightFill = '#fff';
                    dataset.pointHighlightStroke = 'rgba(151,187,205,1)';

                    return dataset;
                })
            });
        }
    }

}
