export class Field {
    constructor(id, caption = undefined, type = 'string') {
        this.id = id;
        this.caption = caption ? caption : id;
        this.type = type;
    }
}