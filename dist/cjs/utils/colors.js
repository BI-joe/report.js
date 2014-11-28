"use strict";
Object.defineProperties(exports, {
  Colors: {get: function() {
      return Colors;
    }},
  __esModule: {value: true}
});
var Colors = function Colors() {};
($traceurRuntime.createClass)(Colors, {
  hexToRgb: function(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) {
      throw Error('"' + hex + '" is not a valid hex color');
    }
    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    };
  },
  rgbToString: function(rgb) {
    var alpha = arguments[1] !== (void 0) ? arguments[1] : 1;
    return 'rgba(' + ([rgb.r, rgb.g, rgb.b, alpha].join(',')) + ')';
  },
  defaultScheme: function() {
    return ['#97bbcd', '#dcdcdc', '#F7464A', '#46BFBD', '#949FB1', '#FDB45C', '#4D5360', '#7cb5ec', '#90ed7d', '#f7a35c', '#8085e9', '#f15c80', '#e4d354', '#8085e8', '#8d4653', '#91e8e1'];
  }
}, {});
