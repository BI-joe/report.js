import {FIELD_MEASURES} from '../../constants';
import {TableRow}  from '../../result/table/tableRow';
import {TableCell} from '../../result/table/tableCell';
import {Maps}      from '../../utils/maps';

export class TableBodyProcessor {

    constructor(measureFields, rowFields, columnFields, options = {}) {
        this.measureFields = measureFields;
        this.rowFields = rowFields;
        this.columnFields = columnFields;
        this.options = options;
    }

    process(resultSet) {
        let mapUtils = new Maps(),
            getBodyCells = (currentRow, columnFields, cells, fieldValues, measure) => {
                let colSets = resultSet.getFieldValuesSets(this.measureFields, columnFields);

                colSets.forEach(set => {
                    let currentMeasure = measure ? measure : set.measure;
                    let cellFieldValues = mapUtils.sum(fieldValues, set.fieldValues);
                    let fieldValue = resultSet.getFieldValue(currentMeasure, cellFieldValues);
                    if (fieldValue !== undefined && fieldValues !== null) {
                        currentRow.addCell(new TableCell(fieldValue.value));
                    } else {
                        currentRow.addCell(new TableCell(''));
                    }
                });
            },

            getRows = (rows, rowFields, columnFields, currentRows, fieldValues = new Map(), row = null, measure = null) => {
                if (rowFields.length === 0) {
                    getBodyCells(row, columnFields, currentRows, fieldValues, measure);
                    return 1;
                }

                let currentFieldId    = rowFields[0],
                    remainingFields   = rowFields.slice(1),
                    countCells        = 0,
                    first             = true;

                if (currentFieldId === FIELD_MEASURES) {
                    this.measureFields.forEach(measureFieldId => {
                        let measureField = resultSet.getField(measureFieldId);
                        let measureFieldIndex = resultSet.getFieldIndex(measureField);
                        let subRows = currentRows.filter(row => row[measureFieldIndex].value !== null && row[measureFieldIndex].value !== undefined);
                        if (subRows.length) {
                            let currentRow = row;
                            if (row === null || !first) {
                                currentRow = new TableRow();
                                rows.push(currentRow);
                            }
                            first = false;
                            let tableCell;
                            if (!this.options.hideHeaders) {
                                tableCell = new TableCell(measureField.caption, { header: true });
                                currentRow.addCell(tableCell);
                            }
                            let childCellsCount = getRows(rows, remainingFields, columnFields, subRows, fieldValues, currentRow, measureField);
                            if (!this.options.hideHeaders) {
                                tableCell.setOption('rowspan', childCellsCount);
                            }
                            countCells += childCellsCount;
                        }
                    });

                    return countCells;
                }

                let currentField      = resultSet.getField(currentFieldId),
                    currentFieldIndex = resultSet.getFieldIndex(currentField);

                resultSet.getFieldValues(currentField).forEach(fieldValue => {
                    let subRows = currentRows.filter(row => row[currentFieldIndex] === fieldValue);
                    if (subRows.length) {
                        let currentRow = row;
                        if (row === null || !first) {
                            currentRow = new TableRow();
                            rows.push(currentRow);
                        }
                        first = false;
                        let currentFieldValues = mapUtils.clone(fieldValues);
                        currentFieldValues.set(currentFieldId, fieldValue);
                        let tableCell;
                        if (!this.options.hideHeaders) {
                            tableCell = new TableCell(fieldValue.value, { header: true });
                            currentRow.addCell(tableCell);
                        }
                        let childCellsCount = getRows(rows, remainingFields, columnFields, subRows, currentFieldValues, currentRow, measure);
                        if (!this.options.hideHeaders) {
                            tableCell.setOption('rowspan', childCellsCount);
                        }
                        countCells += childCellsCount;
                    }
                });

            return countCells;
        };

        let rows = [];
        getRows(rows, this.rowFields, this.columnFields, resultSet.rows);

        return rows;
    }

    getHeaderCells() {
        if (this.options.hideHeaders) {
            return [];
        }
        return [
            new TableCell('', {
                colspan: this.rowFields.length,
                header: true
            })
        ];

    }
}
