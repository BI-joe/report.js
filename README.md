Report.js
=========

[![Build Status](https://travis-ci.org/BI-joe/report.js.svg)](https://travis-ci.org/BI-joe/report.js)


Dependancies
------------
Report.js depend on [Chart.js](http://chartjs.org) for graph rendering

Usage
-----

```javascript
import {Renderer, DOMAdapter} from 'reportjs';

const renderer = new Renderer();
const adapter = new DOMAdapter();
const report = {
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

const output = renderer.render(report);
adapter.renderTo(document.getElementById('#mycontainer'), output);
```

This will output

|          | 2013 | 2014 |
|----------|:----:|:----:|
| My Count |  10  |      |
| My Sum   |  15  |  20  |

Contribute
----------
Install the dependencies

```sh
git clone https://github.com/youknowriad/report.js.git && cd report.js
npm Install
```

Tests
-----

```sh
npm test
```
