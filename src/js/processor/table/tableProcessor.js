import {Table} from '../../result/table/table';
import {TableHeaderProcessor} from './tableHeaderProcessor';
import {TableBodyProcessor} from './tableBodyProcessor';

export class TableProcessor {

    constructor(measureFields, rowFields, columnFields, options = {}) {
        this.measureFields = measureFields;
        this.rowFields     = rowFields;
        this.columnFields  = columnFields;
        this.options       = options;
    }

    process(resultSet) {
        let table = new Table(),
            tableHeaderProcessor = new TableHeaderProcessor(this.measureFields, this.columnFields, {
                hideHeaders: this.options.hideColumnHeaders
            }),
            tableBodyProcessor = new TableBodyProcessor(this.measureFields, this.rowFields, this.columnFields, {
                hideHeaders: this.options.hideRowHeaders
            }),

            headerRows = tableHeaderProcessor.process(resultSet, tableBodyProcessor.getHeaderCells()),
            bodyRows = tableBodyProcessor.process(resultSet);

        headerRows.forEach(row => { table.addRow(row); });
        bodyRows.forEach(row => { table.addRow(row); });

        return table;
    }
}
