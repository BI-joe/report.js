import {SegmentGraph} from '../../result/graph/segmentGraph';

export class SegmentGraphProcessor {

    constructor(measureFields, graphType = 'pie', height = 'auto', width = 'auto') {
        this.measureFields = measureFields;
        this.graphType = graphType;
        this.height    = height;
        this.width     = width;
    }

    getLabel(resultSet, row, measure) {
        return [measure.caption]
            .concat(
                resultSet.fields
                .filter(field => this.measureFields.indexOf(field.id) === -1)
                .reduce((previous, field) => {
                    let fieldIndex = resultSet.getFieldIndex(field.id);
                    return previous.concat([row[fieldIndex].value]);
                }, [])
            ).join(' - ');
    }

    process(resultSet) {
        let labels = [];

        this.measureFields.forEach(measureFieldId => {
            let measure = resultSet.getField(measureFieldId);
            resultSet.rows.forEach(row => {
                let fieldValue = row[resultSet.getFieldIndex(measureFieldId)];
                if (fieldValue.value !== null && fieldValue.value !== undefined) {
                    labels.push({
                        label: this.getLabel(resultSet, row, measure),
                        value: fieldValue.value
                    });
                }
            });
        });

        return new SegmentGraph(this.graphType, labels, this.height, this.width);
    }
}
