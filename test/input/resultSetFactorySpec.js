import {Value} from '../../src/js/input/value';
import {Field} from '../../src/js/input/field';
import {ResultSet} from '../../src/js/input/resultSet';
import {ResultSetFactory} from '../../src/js/input/resultSetFactory';

describe('ResultSetFactory', function() {
    it('buildFromJson', function() {
        let field = new Field('d'),
            value = new Value('dv'),
            resultSet = new ResultSet([field], [[value]]),
            factory = new ResultSetFactory(),
            json = {
                fields: ['d'],
                rows: [
                    ['dv']
                ]
            }
        ;

        expect(factory.buildFromJson(json)).toEqual(resultSet);
    });
});
