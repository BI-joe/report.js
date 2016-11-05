import Chart from 'chart.js';
import { hexToRgb, rgbToString, defaultScheme } from '../utils/colors';

function getHeight(element, height = 'auto') {
    if (height === 'auto') {
        return element.offsetHeight > 140 ? element.offsetHeight : 300;
    } else {
        return height;
    }
}

function getWidth(element, width = 'auto') {
    if (width === 'auto') {
        return element.offsetWidth > 90 ? element.offsetWidth : 300;
    } else {
        return width;
    }
}

function generateRandomColors(colorScheme, index) {
    let colorIndex = index % colorScheme.length;
    return generateColors(colorScheme[colorIndex]);
}

function generateColors(color) {
    const rgbColor = hexToRgb(color);
    return {
        backgroundColor: rgbToString(rgbColor, 0.2),
        borderColor: rgbToString(rgbColor, 1),
        pointBorderColor: rgbToString(rgbColor, 1),
        pointBackgroundColor: rgbToString(rgbColor, 1),
        pointHoverBackgroundColor: rgbToString(rgbColor, 0.1)
    }
}

export class DOMGraphChartjsAdapter {
    renderGraphToCanvas(canvas, graph) {
        const getChartData = function(graph) {
            const colorScheme = defaultScheme;
            const datasets = graph.datasets.map((dataset, index) => {
                const data = graph.getOption('linear')
                    ? dataset.data
                        .map((value, index) => ({
                            x: graph.labels[index],
                            y: value
                        }))
                    : dataset.data;
                const colors = dataset.options.color
                    ? generateColors(dataset.options.color)
                    : generateRandomColors(colorScheme, index);

                return Object.assign({
                    label: dataset.label,
                    pointRadius: dataset.options.pointRadius,
                    fill: 'fill' in dataset.options ? dataset.options.fill : true,
                    data
                }, colors);
            });

            return {
                labels: graph.labels,
                datasets
            };
        };

        const spanGaps = graph.getOption('spanGaps');
        const scaleOptions = graph.getOption('linear')
            ? {
                scales: {
                    xAxes: [{
                        type: 'linear',
                        position: 'bottom'
                    }]
                }
            }
            : {};
        const options = Object.assign({ spanGaps }, scaleOptions);

        const context = canvas.getContext('2d'),
            chart = new Chart(context, {
                type: graph.graphType,
                data: getChartData(graph),
                options
            });

        return chart;
    }

    renderSegmentGraphToCanvas(canvas, graph) {
        let getChartData = function(graph) {
            const colorScheme = defaultScheme;
            const colors = graph.labels.map((label, index) => generateRandomColors(colorScheme, index));

            return {
                datasets: [{
                    data: graph.labels.map(label => label.value),
                    backgroundColor: colors.map(color => color.borderColor),
                    hoverBorderColor: colors.map(color => color.borderColor),
                    hoverBackgroundColor: colors.map(color => color.backgroundColor)
                }],
                labels: graph.labels.map(label => label.label)
            };
        };

        const context = canvas.getContext('2d'),
            chart = new Chart(context, {
                type: graph.graphType,
                data: getChartData(graph)
            });

        return chart;
    }

    renderGraphTo(element, graph) {
        element.innerHTML = '';
        let canvas = document.createElement('CANVAS');
        canvas.setAttribute('width', getWidth(element, graph.width));
        canvas.setAttribute('height', getHeight(element, graph.height));
        element.appendChild(canvas);
        this.renderGraphToCanvas(canvas, graph);
    }

    renderSegmentGraphTo(element, graph) {
        element.innerHTML = '';
        let canvas = document.createElement('CANVAS');
        canvas.setAttribute('width', getWidth(element, graph.width));
        canvas.setAttribute('height', getHeight(element, graph.height));
        element.appendChild(canvas);
        this.renderSegmentGraphToCanvas(canvas, graph);
    }
}
