const defaultOptions = {
    linear: false,
    spanGaps: false
};

export class Graph {

    constructor(graphType, labels = [], datasets = [], height = 'auto', width = 'auto', options) {
        this.graphType = graphType;
        this.labels   = labels;
        this.datasets = datasets;
        this.height = height;
        this.width = width;
        this.options = Object.assign({}, defaultOptions, options);
    }

    addDataset(dataset) {
        this.datasets.push(dataset);
    }

    getOption(key) {
        return this.options[key];
    }
}
