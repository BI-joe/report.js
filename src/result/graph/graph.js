export class Graph {

    constructor(graphType, labels = [], datasets = [], height = 'auto') {
        this.graphType = graphType;
        this.labels   = labels;
        this.datasets = datasets;
        this.height = height;
    }

    addDataset(dataset) {
        this.datasets.push(dataset);
    }
}
