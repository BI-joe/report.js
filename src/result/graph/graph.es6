export class Graph {

    constructor(graphType, labels = [], datasets = []) {
        this.graphType = graphType;
        this.labels   = labels;
        this.datasets = datasets;
    }

    addDataset(dataset) {
        this.datasets.push(dataset);
    }
}
