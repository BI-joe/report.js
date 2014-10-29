export class ChartjsAdapter {

    renderGraphTo(element, graph) {
        let getChartData = function(graph) {
                return {
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
                };
            };

        element.prepend('<canvas width="'+element.width()+'" height="400"></canvas>');
        let context = element.find('canvas:first').get(0).getContext('2d'),
            chart = new Chart(context);

        switch (graph.graphType) {
            case 'line':
                chart.Line(getChartData(graph));
                break;
            case 'bar':
                chart.Bar(getChartData(graph));
                break;
            case 'radar':
                chart.Radar(getChartData(graph));
                break;
            default:
                throw Error('Unknown graph type "' + graph.graphType + '"');
        }
    }

    renderSegmentGraphTo(element, graph) {
        let getChartData = function(graph) {
                return graph.labels.map(label => {
                    label.color = 'rgba(151,187,205,0.5)';
                    label.highlight = 'rgba(151,187,205,1)';

                    return label;
                });
            };

        element.prepend('<canvas width="'+element.width()+'" height="400"></canvas>');
        let context = element.find('canvas:first').get(0).getContext('2d'),
            chart = new Chart(context);

        switch (graph.graphType) {
            case 'pie':
                chart.Pie(getChartData(graph));
                break;
            case 'polarArea':
                chart.PolarArea(getChartData(graph));
                break;
            case 'doughnut':
                chart.Doughnut(getChartData(graph));
                break;
            default:
                throw Error('Unknown segment graph type "' + graph.graphType + '"');
        }
    }
}
