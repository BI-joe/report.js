export class OutputHtml {

    getHtml(result) {
        let
            getHtmlForTable = function(table) {
                let html = '';
                table.rows.forEach(row => {
                    let rowHtml = '';
                    row.cells.forEach(cell => {
                        let cellAttributes = [];
                        if (cell.options.rowspan !== undefined && cell.options.rowspan > 1) {
                            cellAttributes.push('rowspan="'+cell.options.rowspan+'"');
                        }
                        if (cell.options.colspan !== undefined && cell.options.colspan > 1) {
                            cellAttributes.push('colspan="'+cell.options.colspan+'"');
                        }

                        rowHtml += '<td' + (cellAttributes.length ? ' ' + cellAttributes.join(' ') : '') + '>' + cell.value + '</td>';
                    });

                    rowHtml = '<tr>' + rowHtml + '</tr>';
                    html += rowHtml;
                });

                return '<table>' + html + '</table>';
            },
            htmls = [];
        result.results.forEach(table => {
            htmls.push(getHtmlForTable(table));
        });

        return htmls.join();
    }

}
