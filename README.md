Report.js
=========

[![Build Status](https://travis-ci.org/BI-joe/report.js.svg)](https://travis-ci.org/BI-joe/report.js)


Dependancies
------------
Report.js depend on [Chart.js](http://chartjs.org) for graph rendering.
You need to add an ES6 polyfill (core-js or babel-pollyfill) to use this library.

Usage
-----

```javascript
import {Processor, DOMAdapter} from 'reportjs';

const processor = new Processor();
const adapter = new DOMAdapter();
const report = {
    data: {
        fields: [ 'Year', 'My Count', 'My Sum' ],
        rows: [
            ['2013', 10, 15],
            ['2014', null, 20]
        ]
    },
    layout: {
        type: 'table',
        rows: ['measures'],
        columns: ['Year'],
        measures: ['My Count', 'My Sum']
    }
};

const output = processor.process(report);
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
git clone https://github.com/BI-joe/report.js.git && cd report.js
npm Install
```

Tests
-----

```sh
npm test
```
