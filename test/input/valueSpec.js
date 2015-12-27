import {Value} from '../../src/js/input/value';

describe('Value', function() {
    it('constructor', function() {
        let fieldValue = new Value(10);
        expect(fieldValue.value).toBe(10);
    });
});
