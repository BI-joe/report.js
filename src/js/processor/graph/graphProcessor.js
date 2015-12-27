import {Graph} from '../../result/graph/graph';
import {Maps}  from '../../utils/maps';
import {FIELD_MEASURES} from '../../constants';

export class GraphProcessor {

    constructor(measureFields, datasetsFields, labelsFields, graphType = 'line', height = 'auto', width = 'auto') {
        this.measureFields  = measureFields;
        this.datasetsFields = datasetsFields;
        this.labelsFields   = labelsFields;
        this.graphType      = graphType;
        this.height         = height;
        this.width          = width;
    }

    getLabel(resultSet, fields, fieldValues, measure) {
        return fields.reduce((previous, fieldId) => {
            if (fieldId === FIELD_MEASURES) {
                return previous.concat([measure.caption]);
            } else {
                return previous.concat([fieldValues.get(fieldId).value]);
            }
        }, []).join(' - ');
    }

    process(resultSet) {
        let maps = new Maps();
        let datasetsSets = resultSet.getFieldValuesSets(this.measureFields, this.datasetsFields);
        let labelsSets   = resultSet.getFieldValuesSets(this.measureFields, this.labelsFields);

        let labels = [];
        labelsSets.forEach(labelSet => {
            labels.push(this.getLabel(resultSet, this.labelsFields, labelSet.fieldValues, labelSet.measure));
        });

        let datasets = [];
        datasetsSets.forEach(datasetSet => {
            let dataset = {
                label: this.getLabel(resultSet, this.datasetsFields, datasetSet.fieldValues, datasetSet.measure),
                data: []
            };
            datasets.push(dataset);
            labelsSets.forEach(labelSet => {
                let measure = datasetSet.measure ? datasetSet.measure : labelSet.measure;
                let fieldValues = maps.sum(datasetSet.fieldValues, labelSet.fieldValues);

                let fieldValue = resultSet.getFieldValue(measure, fieldValues);
                if (fieldValue) {
                    dataset.data.push(fieldValue.value);
                } else {
                    dataset.data.push(null);
                }
            });
        });

        return new Graph(this.graphType, labels, datasets, this.height, this.width);
    }
}
