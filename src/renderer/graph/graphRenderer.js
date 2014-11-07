import {Graph} from '../../result/graph/graph';

export class GraphRenderer {

    constructor(datasetsDimensions, labelsDimensions, graphType = 'line') {
        this.datasetsDimensions = datasetsDimensions;
        this.labelsDimensions   = labelsDimensions;
        this.graphType          = graphType;
    }

    render(grid) {
        let datasetsDimensionId = 'dataset',
            labelsDimensionId = 'label',
            mergedGrid = grid.mergeDimensions(this.datasetsDimensions.map(dimension => grid.getDimension(dimension)), datasetsDimensionId);
        mergedGrid = mergedGrid.mergeDimensions(this.labelsDimensions.map(dimension => grid.getDimension(dimension)), labelsDimensionId);

        let labels = [];
        mergedGrid.getDimensionValues(mergedGrid.getDimension(labelsDimensionId)).forEach(labelDV => {
            labels.push(labelDV.caption);
        });

        let datasets = [];
        mergedGrid.getDimensionValues(mergedGrid.getDimension(datasetsDimensionId)).forEach(datasetDV => {
            let dataset = {
                label: datasetDV.caption,
                data: []
            };
            mergedGrid.getDimensionValues(mergedGrid.getDimension(labelsDimensionId)).forEach(labelDV => {
                let cellDimensionValues = new Map();
                cellDimensionValues.set(datasetsDimensionId, datasetDV);
                cellDimensionValues.set(labelsDimensionId, labelDV);

                let cell = mergedGrid.getCell(cellDimensionValues);
                if (cell) {
                    dataset.data.push(cell.value);
                } else {
                    dataset.data.push(null);
                }
            });
            datasets.push(dataset);
        });

        return new Graph(this.graphType, labels, datasets);
    }
}
