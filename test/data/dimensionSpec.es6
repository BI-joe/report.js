import {Dimension} from 'data/dimension';

describe('Dimension', function() {
    it('constructor', function() {
        let dimension = new Dimension('myId');
        expect(dimension.id).toBe('myId');
        expect(dimension.caption).toBe('myId');

        dimension = new Dimension('myId', 'myCaption');
        expect(dimension.id).toBe('myId');
        expect(dimension.caption).toBe('myCaption');
    });
});
