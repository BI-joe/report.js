import {Value} from '../../src/js/input/value';
import {Field} from '../../src/js/input/field';
import {ResultSet} from '../../src/js/input/resultSet';

describe('ResultSet', function() {
    it('constructor', function() {
        let field = new Field('d'),
            value = new Value('dv'),
            resultSet = new ResultSet([field], [[value]])
        ;

        expect(resultSet.fields).toEqual([field]);
        expect(resultSet.rows).toEqual([[value]]);
    });

    it('getField and getFieldIndex', function() {

        let field = new Field('d'),
            value = new Value('dv'),
            resultSet = new ResultSet([field], [[value]])
        ;

        expect(resultSet.getField('d')).toEqual(new Field('d'));
        expect(resultSet.getFieldIndex('d')).toEqual(0);
    });

    it('getFieldValue', function() {
        let field = new Field('d'),
            measure = new Field('m'),
            value1 = new Value('dv1'),
            value2 = new Value('dv2'),
            m1 = new Value(10),
            m2 = new Value(20),
            resultSet = new ResultSet([field, measure], [
                [value1, m1],
                [value2, m2]
            ]),
            fieldValues = new Map()
        ;
        fieldValues.set('d', value2);

        expect(resultSet.getFieldValue(measure, fieldValues)).toEqual(m2);
    });

    it('getFieldValuesSets', function() {
        // Input
        let field = new Field('d'),
            measure = new Field('m'),
            measure2 = new Field('m2'),
            value1 = new Value('dv1'),
            value2 = new Value('dv2'),
            m1 = new Value(10),
            m2 = new Value(20),
            m21 = new Value(10),
            m22 = new Value(20),
            resultSet = new ResultSet([field, measure, measure2], [
                [value1, m1, m21],
                [value2, m2, m22]
            ]),
            fieldValues = new Map()
        ;
        fieldValues.set('d', value2);

        // output
        let fieldValues1 = new Map([['d', value1]]),
            fieldValues2 = new Map([['d', value2]]);

        expect(resultSet.getFieldValuesSets(['m', 'm2'], ['d'])).toEqual([
            { fieldValues: fieldValues1, measure: undefined },
            { fieldValues: fieldValues2, measure: undefined }
        ]);

        expect(resultSet.getFieldValuesSets(['m', 'm2'], ['d', 'measures'])).toEqual([
            { fieldValues: fieldValues1, measure: measure },
            { fieldValues: fieldValues1, measure: measure2 },
            { fieldValues: fieldValues2, measure: measure },
            { fieldValues: fieldValues2, measure: measure2 }
        ]);
    });
});
