export class Graph {

    constructor(labels = [], datasets = []) {
        this.labels   = labels;
        this.datasets = datasets;
    }

    addDataset(dataset) {
        this.datasets.push(dataset);
    }
}
