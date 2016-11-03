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

function generateColors(colorScheme, index) {
    let colorIndex = index % colorScheme.length,
        rgbColor = hexToRgb(colorScheme[colorIndex]);

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
            return {
                labels: graph.labels,
                datasets: graph.datasets.map((dataset, index) => {
                    return Object.assign(generateColors(colorScheme, index), dataset);
                })
            };
        };

        const context = canvas.getContext('2d'),
            chart = new Chart(context, {
                type: graph.graphType,
                data: getChartData(graph)
            });

        return chart;
    }

    renderSegmentGraphToCanvas(canvas, graph) {
        let getChartData = function(graph) {
            const colorScheme = defaultScheme;
            const colors = graph.labels.map((label, index) => generateColors(colorScheme, index));
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
