import {FIELD_MEASURES} from '../constants';
import {Maps}           from '../utils/maps';

export class ResultSet {
    constructor(fields, rows) {
        this.fields = fields;
        this.rows = rows;
    }

    getField(id) {
        return this.fields.find(field => field.id === id);
    }

    getFieldIndex(field) {
        return this.fields.findIndex(f => f.id === field.id);
    }

    getFieldValues(field) {
        let values = new Map();
        const index = this.getFieldIndex(field);
        this.rows.forEach(row => {
            if (!values.has(row[index].value)) {
                values.set(row[index].value, row[index]);
            }
        });

        return values;
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
                        let measure = this.getField(measureId);
                        let measureFieldIndex = this.getFieldIndex(measure);
                        let hasRows = rows.some(row => row[measureFieldIndex].value !== null && row[measureFieldIndex].value !== undefined);
                        if (hasRows) {
                            getSets(sets, remainingFields, rows, { fieldValues: set.fieldValues, measure: this.getField(measureId) });
                        }
                    });
                    return;
                }

                let currentField = this.getField(currentFieldId),
                    currentFieldIndex = this.getFieldIndex(currentField);

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
        let row = this.rows.find(row => {
            let found = true;
            fieldValues.forEach((fieldValue, fieldId) => {
                let field = this.getField(fieldId),
                    fieldIndex = this.getFieldIndex(field);
                // I dont know why exactly I dont get the same instance of fieldValue in unit tests here
                if (row[fieldIndex].value !== fieldValue.value) {
                    found = false;
                }
            });

            return found;
        });

        if (row) {
            return row[this.getFieldIndex(measureField)];
        }
    }
}