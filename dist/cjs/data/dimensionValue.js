"use strict";
Object.defineProperties(exports, {
  DimensionValue: {get: function() {
      return DimensionValue;
    }},
  __esModule: {value: true}
});
var DimensionValue = function DimensionValue(id, caption) {
  this.id = id;
  this.caption = caption === undefined ? id : caption;
};
($traceurRuntime.createClass)(DimensionValue, {}, {});
