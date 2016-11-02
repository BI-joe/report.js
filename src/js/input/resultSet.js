import {FIELD_MEASURES} from '../constants';
import {Maps}           from '../utils/maps';

const KEY_SEPARATOR = '||'

export class ResultSet {
    constructor(fields, rows) {
        this.fields = fields;
        this.rows = rows;

        // Perf optimisations
        this.indexedFields = this.fields.reduce((indexedFields, field, index) =>
            Object.assign(
                indexedFields, {
                [field.id]: {
                    index,
                    field
                }
            }),
            {}
        );
    }

    getField(id) {
        return this.indexedFields[id] ? this.indexedFields[id].field : undefined;
    }

    getFieldIndex(id) {
        return this.indexedFields[id] ? this.indexedFields[id].index : undefined;
    }

    getFieldValues(field) {
        let values = new Map();
        const index = this.getFieldIndex(field.id);
        this.rows.forEach(row => {
            if (!values.has(row[index].value)) {
                values.set(row[index].value, row[index]);
            }
        });

        return values;
    }

    groupBy(dimension1Fields, dimension2Fields) {
        const result = {};
        this.rows.forEach(row => {
            const dimension1FieldValues = dimension1Fields.map(fieldId => {
                const fieldIndex = this.getFieldIndex(fieldId);
                return row[fieldIndex];
            });
            const dimension1Key = this.getGroupKeyForFieldValues(dimension1FieldValues);
            const dimension2FieldValues = dimension2Fields.map(fieldId => {
                const fieldIndex = this.getFieldIndex(fieldId);
                return row[fieldIndex];
            });
            const dimension2Key = this.getGroupKeyForFieldValues(dimension2FieldValues);
            if (! result[dimension1Key]) {
                result[dimension1Key] = {};
            }
            result[dimension1Key][dimension2Key] = row;
        });

        return result;
    }

    getGroupKeyForFieldValues(fieldValues) {
        const keys = [];
        fieldValues.forEach(fieldValue => {
            keys.push(fieldValue ? fieldValue.value : '');
        });
        return keys.join(KEY_SEPARATOR);
    }

    getFieldValuesSets(measureFields, fields) {
        let mapUtils = new Maps(),
            getSets = (sets, fields, rows, set = { fieldValues: new Map(), measure: undefined }) => {
                if (fields.length === 0) {
                    sets.push(set);
                    return;
                }

                let currentFieldId    = fields[0],
                    remainingFields   = fields.slice(1);

                if (currentFieldId === FIELD_MEASURES) {
                    measureFields.forEach(measureId => {
                        let measureFieldIndex = this.getFieldIndex(measureId);
                        let hasRows = rows.some(row => row[measureFieldIndex].value !== null && row[measureFieldIndex].value !== undefined);
                        if (hasRows) {
                            getSets(sets, remainingFields, rows, { fieldValues: set.fieldValues, measure: this.getField(measureId) });
                        }
                    });
                    return;
                }

                let currentField = this.getField(currentFieldId),
                    currentFieldIndex = this.getFieldIndex(currentFieldId);

                this.getFieldValues(currentField).forEach(fieldValue => {
                    let subRows = rows.filter(row => row[currentFieldIndex] === fieldValue);
                    if (subRows.length) {
                        let currentSet = { measure: set.measure, fieldValues: mapUtils.clone(set.fieldValues) };
                        currentSet.fieldValues.set(currentField.id, fieldValue);
                        getSets(sets, remainingFields, subRows, currentSet);
                    }
                });
            };

        let sets = [];
        getSets(sets, fields, this.rows);

        return sets;
    }

    getFieldValue(measureField, fieldValues) {
        const arrayFieldValues = Array.from(fieldValues);
        let row = this.rows.find(row => {
            return arrayFieldValues.every(([fieldId, fieldValue]) => {
                let fieldIndex = this.getFieldIndex(fieldId);
                // I dont know why exactly I dont get the same instance of fieldValue in unit tests here
                return row[fieldIndex].value === fieldValue.value;
            });
        });

        if (row) {
            return row[this.getFieldIndex(measureField.id)];
        }
    }
}
