import {FIELD_MEASURES} from '../../constants';
import {TableRow}  from '../../result/table/tableRow';
import {TableCell} from '../../result/table/tableCell';

export class TableHeaderProcessor {

    constructor(measureFields, columnFields, options = {}) {
        this.measureFields = measureFields;
        this.columnFields = columnFields;
        this.options = options;
    }

    process(resultSet, headerCells = []) {
        if (this.options.hideHeaders) {
            return [];
        }

        let getHeaderRows = (outputRows, fields, currentRows) => {
                if (fields.length === 0) {
                    return 1;
                }

                let currentFieldId         = fields[0],
                    remainingFields        = fields.slice(1),
                    countCells             = 0,
                    currentRow;
                if (outputRows.has(currentFieldId)) {
                    currentRow = outputRows.get(currentFieldId);
                } else {
                    currentRow = new TableRow();
                    outputRows.set(currentFieldId, currentRow);
                }

                if (currentFieldId === FIELD_MEASURES) {
                    this.measureFields.forEach(measureFieldId => {
                        let measureField = resultSet.getField(measureFieldId);
                        let measureFieldIndex = resultSet.getFieldIndex(measureField);
                        let subRows = currentRows.filter(row => row[measureFieldIndex].value !== null && row[measureFieldIndex].value !== undefined);
                        if (subRows.length) {
                            let childCellsCount = getHeaderRows(outputRows, remainingFields, subRows);
                            currentRow.addCell(new TableCell(measureField.caption, {
                                colspan: childCellsCount,
                                header: true
                            }));
                            countCells += childCellsCount;
                        }
                    });

                    return countCells;
                }

                let currentField           = resultSet.getField(currentFieldId),
                    currentFieldIndex      = resultSet.getFieldIndex(currentField);
                resultSet.getFieldValues(currentField).forEach(fieldValue => {
                    let subRows = currentRows.filter(row => row[currentFieldIndex] === fieldValue);
                    if (subRows.length) {
                        let childCellsCount = getHeaderRows(outputRows, remainingFields, subRows);
                        currentRow.addCell(new TableCell(fieldValue.value, {
                            colspan: childCellsCount,
                            header: true
                        }));
                        countCells += childCellsCount;
                    }
                });

                return countCells;
            };

        let rowsMap = new Map();
        if (this.columnFields.length === 0) {
            return headerCells.concat([new TableRow([ new TableCell('', { header: true }) ])]);
        } else {
            getHeaderRows(rowsMap, this.columnFields, resultSet.rows);
            let rows = [];
            rowsMap.forEach(row => {
                row.cells = headerCells.concat(row.cells);
                rows.push(row);
            });
            return rows;
        }
    }
}
