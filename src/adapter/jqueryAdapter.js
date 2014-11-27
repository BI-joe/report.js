export class JQueryAdapter {
    renderTableTo(element, table) {
      element.html(table.getHtml());
    }
}
