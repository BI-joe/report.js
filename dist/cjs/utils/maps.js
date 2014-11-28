"use strict";
Object.defineProperties(exports, {
  Maps: {get: function() {
      return Maps;
    }},
  __esModule: {value: true}
});
var Maps = function Maps() {};
($traceurRuntime.createClass)(Maps, {
  clone: function(map) {
    var newMap = new Map();
    map.forEach((function(value, key) {
      newMap.set(key, value);
    }));
    return newMap;
  },
  sum: function(map1, map2) {
    var newMap = new Map();
    map1.forEach((function(value, key) {
      newMap.set(key, value);
    }));
    map2.forEach((function(value, key) {
      newMap.set(key, value);
    }));
    return newMap;
  }
}, {});
