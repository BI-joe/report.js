export class TableRow {

    constructor(cells = []) {
        this.cells = cells;
    }

    addCell(cell) {
        this.cells.push(cell);
    }

}
