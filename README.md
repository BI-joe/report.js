Report.js
=========

[![Build Status](https://travis-ci.org/youknowriad/report.js.svg)](https://travis-ci.org/youknowriad/report.js)


Dependancies
------------
Report.js depend on [jQuery](http://jquery.com), [Lodash](http://lodash.com) and [Chart.js](http://chartjs.org).
Don't forget to add them to your page.

Usage
-----

```javascript
import {Renderer} from 'reportjs';

let renderer = new Renderer(),
    options = {
        data: {
            dimensions: [{ id: 'Measures'}, { id: 'Year' }],
            dimensionValues: [
                [{ id: 'count', caption: 'My Count' }, { id: 'sum', caption: 'My Sum' }],
                [{ id: '2013' }, { id: '2014' }]
            ],
            cells: [
                {value: 10, dimensionValues: [0, 0]},
                {value: 20, dimensionValues: [1, 1]},
                {value: 15, dimensionValues: [0, 1]}
            ]
        },
        layout: {
            type: 'table',
            rows: ['Measures'],
            columns: ['Measures', 'Category']
        }
    };

renderer.renderTo($('#mydiv'), options);
```

This will output

|          | 2013 | 2014 |
|----------|:----:|:----:|
| My Count |  10  |      |
| My Sum   |  15  |  20  |

For a browser example without ES6, check [the demo](http://youknowriad.github.io/report.js)

Contribute
----------
Install the dependencies

```sh
git clone https://github.com/youknowriad/report.js.git && cd report.js
npm install
bower install
```

Tests
-----

```sh
npm test
```
