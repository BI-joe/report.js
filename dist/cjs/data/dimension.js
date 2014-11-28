"use strict";
Object.defineProperties(exports, {
  Dimension: {get: function() {
      return Dimension;
    }},
  __esModule: {value: true}
});
var Dimension = function Dimension(id, caption) {
  this.id = id;
  this.caption = caption === undefined ? id : caption;
};
($traceurRuntime.createClass)(Dimension, {}, {});
