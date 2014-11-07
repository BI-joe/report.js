export class Table {

    constructor(rows = []) {
        this.rows = rows;
    }

    addRow(row) {
        this.rows.push(row);
    }

    getHtml() {
        let html = '';
        this.rows.forEach(row => {
            let rowHtml = '';
            row.cells.forEach(cell => {
                let cellAttributes = [];
                if (cell.options.rowspan !== undefined && cell.options.rowspan > 1) {
                    cellAttributes.push('rowspan="'+cell.options.rowspan+'"');
                }
                if (cell.options.colspan !== undefined && cell.options.colspan > 1) {
                    cellAttributes.push('colspan="'+cell.options.colspan+'"');
                }

                let tag = cell.options.header === undefined || !cell.options.header ? 'td' : 'th';
                rowHtml += '<' + tag + (cellAttributes.length ? ' ' + cellAttributes.join(' ') : '') + '>' + cell.value + '</' + tag + '>';
            });

            rowHtml = '<tr>' + rowHtml + '</tr>';
            html += rowHtml;
        });

        return '<table>' + html + '</table>';
    }
}
