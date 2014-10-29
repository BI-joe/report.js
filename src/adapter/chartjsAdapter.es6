import {Colors} from 'utils/colors';

export class ChartjsAdapter {

    renderGraphTo(element, graph) {
        let getChartData = function(graph) {
                let index = 0,
                    colors = new Colors(),
                    colorScheme = colors.defaultScheme();
                return {
                    labels: graph.labels,
                    datasets: graph.datasets.map(dataset => {
                        let colorIndex = index % colorScheme.length,
                            rgbColor = colors.hexToRgb(colorScheme[colorIndex]);
                        dataset.fillColor = colors.rgbToString(rgbColor, 0.2);
                        dataset.strokeColor = colors.rgbToString(rgbColor, 1);
                        dataset.pointColor = colors.rgbToString(rgbColor, 1);
                        dataset.pointStrokeColor = colors.rgbToString(rgbColor, 0.1);
                        dataset.pointHighlightFill = colors.rgbToString(rgbColor, 0.1);
                        dataset.pointHighlightStroke = colors.rgbToString(rgbColor, 1);
                        index++;

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
                let index = 0,
                    colors = new Colors(),
                    colorScheme = colors.defaultScheme();
                return graph.labels.map(label => {
                    let colorIndex = index % colorScheme.length,
                        rgbColor = colors.hexToRgb(colorScheme[colorIndex]);
                    label.color = colors.rgbToString(rgbColor, 0.8);
                    label.highlight = colors.rgbToString(rgbColor, 1);
                    index++;

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
