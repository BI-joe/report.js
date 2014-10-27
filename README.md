Report.js
=========

[![Build Status](https://travis-ci.org/youknowriad/report.js.svg)](https://travis-ci.org/youknowriad/report.js)


Usage
-----

```javascript
import {GridFactory} from 'data/gridFactory';
import {TableRenderer} from 'data/tableRenderer';
import {OutputHtml} from 'output/outputHtml';
import {Result} from 'result/result';

// Building the grid
let gridFactory = new GridFactory();
    grid = gridFactory.buildFromJson({
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
    });

// Rendering the grid
let tableRenderer = new TableRenderer(['Year'], ['Measures']),
    table = tableRenderer.render(grid),
    result = new Result();
result.addResult(table);

// Output to the dom
let outputHtml = new OutputHtml();
$('#mydiv').html(outputHtml.getHtml(result));

```

This will output

| Tables   |      Are      |  Cool |
|----------|:-------------:|------:|
| col 1 is |  left-aligned | $1600 |
| col 2 is |    centered   |   $12 |
| col 3 is | right-aligned |    $1 |

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
