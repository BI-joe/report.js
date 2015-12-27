import {Field} from './field';
import {ResultSet} from './resultSet';
import {Value} from './value';

export class ResultSetFactory {
    buildFromJson(data) {
        let fields = data.fields.map(field => {
            if (field instanceof String || typeof field === 'string') {
                return new Field(field);
            } else {
                return new Field(field.id, field.caption, field.type);
            }
        });

        let rows = data.rows.map(row => {
            if (row.length !== fields.length) {
                throw 'Invalid row values length';
            }

            return row.map(value => new Value(value));
        });

        return new ResultSet(fields, rows);
    }
}
