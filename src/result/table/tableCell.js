export class TableCell {

    constructor(value, options = {}) {
        this.value = value;
        this.options = options;
    }

    setOption(key, value) {
        this.options[key] = value;
    }
}
