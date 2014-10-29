import {SegmentGraph} from 'result/graph/segmentGraph';

export class SegmentGraphRenderer {

    constructor(graphType = 'pie') {
        this.graphType          = graphType;
    }

    render(grid) {
        let dimensions = [];
        grid.dimensions.forEach(dim => { dimensions.push(dim); });

        let labelsDimensionId = 'label',
            mergedGrid = grid.mergeDimensions(dimensions, labelsDimensionId);

        let labels = [];
        mergedGrid.getDimensionValues(mergedGrid.getDimension(labelsDimensionId)).forEach(labelDV => {
            let cellDimensionValues = new Map();
            cellDimensionValues.set(labelsDimensionId, labelDV);
            let cell = mergedGrid.getCell(cellDimensionValues);

            labels.push({
                label: labelDV.caption,
                value: cell.value
            });
        });

        return new SegmentGraph(this.graphType, labels);
    }
}
