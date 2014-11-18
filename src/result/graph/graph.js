export class Graph {

    constructor(graphType, labels = [], datasets = [], height = 'auto', width = 'auto') {
        this.graphType = graphType;
        this.labels   = labels;
        this.datasets = datasets;
        this.height = height;
        this.width = width;
    }

    addDataset(dataset) {
        this.datasets.push(dataset);
    }
}
