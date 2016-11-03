import {Graph} from '../../result/graph/graph';
import {FIELD_MEASURES} from '../../constants';

export class GraphProcessor {

    constructor(measureFields, datasetsFields, labelsFields, graphType = 'line', height = 'auto', width = 'auto', options = {}) {
        this.measureFields  = measureFields.map(measure => typeof measure === 'object' ? measure.name : measure);
        this.datasetsFields = datasetsFields;
        this.labelsFields   = labelsFields;
        this.graphType      = graphType;
        this.height         = height;
        this.width          = width;
        this.options        = options;
        this.measureOptions = measureFields.reduce((config, measure) => {
            const measureName = typeof measure === 'object' ? measure.name : measure;
            return Object.assign({
                [measureName]: typeof measure === 'object' ? measure : {}
            }, config)
        }, {});
    }

    getLabel(resultSet, fields, fieldValues, measure) {
        const parts = fields.reduce((previous, fieldId) => {
            if (fieldId === FIELD_MEASURES) {
                return previous.concat([measure.caption]);
            } else {
                return previous.concat([fieldValues.get(fieldId).value]);
            }
        }, []);

        return parts.length === 1 ? parts[0] : parts.join(' - ');
    }

    process(resultSet) {
        const groupedRows = resultSet.groupBy(this.datasetsFields, this.labelsFields);
        let datasetsSets = resultSet.getFieldValuesSets(this.measureFields, this.datasetsFields);
        let labelsSets   = resultSet.getFieldValuesSets(this.measureFields, this.labelsFields);

        let labels = [];
        labelsSets.forEach(labelSet => {
            labels.push(this.getLabel(resultSet, this.labelsFields, labelSet.fieldValues, labelSet.measure));
        });

        let datasets = [];
        datasetsSets.forEach(datasetSet => {
            const dataset = {
                label: this.getLabel(resultSet, this.datasetsFields, datasetSet.fieldValues, datasetSet.measure),
                data: [],
                options: {}
            };
            if (datasetSet.measure) {
                dataset.options = this.measureOptions[datasetSet.measure.id];
            }
            const datasetKey = resultSet.getGroupKeyForFieldValues(datasetSet.fieldValues);
            datasets.push(dataset);
            labelsSets.forEach(labelSet => {
                const measure = datasetSet.measure ? datasetSet.measure : labelSet.measure;
                const measureIndex = resultSet.getFieldIndex(measure.id);
                const labelKey = resultSet.getGroupKeyForFieldValues(labelSet.fieldValues);
                const row = groupedRows[datasetKey] ? groupedRows[datasetKey][labelKey] : false;
                if (row) {
                    const fieldValue = row[measureIndex];
                    dataset.data.push(fieldValue.value);
                } else {
                    dataset.data.push(null);
                }
            });
        });

        return new Graph(this.graphType, labels, datasets, this.height, this.width, this.options);
    }
}
