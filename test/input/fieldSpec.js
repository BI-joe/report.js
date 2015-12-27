import {Field} from '../../src/js/input/field';

describe('Field', function() {
    it('constructor', function() {
        let field = new Field('myId');
        expect(field.id).toBe('myId');
        expect(field.caption).toBe('myId');
        expect(field.type).toBe('string');
    });

    it('constructor with caption and type', function() {
        let field = new Field('myId', 'myCaption', 'number');
        expect(field.id).toBe('myId');
        expect(field.caption).toBe('myCaption');
        expect(field.type).toBe('number');
    });
});
