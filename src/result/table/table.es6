export class Table {

    constructor(rows = []) {
        this.rows = rows;
    }

    addRow(row) {
        this.rows.push(row);
    }
}
