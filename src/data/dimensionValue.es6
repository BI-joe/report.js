export class DimensionValue {

    constructor(id, caption) {
        this.id      = id;
        this.caption = caption === undefined ? id : caption;
    }

}
