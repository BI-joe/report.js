export class DOMTableAdapter {
    renderTableTo(domElement, table) {
        domElement.innerHTML = table.getHtml();
    }
}
