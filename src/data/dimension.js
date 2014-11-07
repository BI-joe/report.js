export class Dimension {

    constructor(id, caption) {
        this.id      = id;
        this.caption = caption === undefined ? id : caption;
    }

}
