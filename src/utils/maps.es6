export class Maps {

    constructor(dimensionValues, value) {}

    clone(map) {
        let newMap = new Map();
        map.forEach(function(value, key) {
            newMap.set(key, value);
        });
        
        return newMap;
    }
    
    sum(map1, map2) {
        let newMap = new Map();
        map1.forEach(function(value, key) {
            newMap.set(key, value);
        });
        map2.forEach(function(value, key) {
            newMap.set(key, value);
        });
        
        return newMap;
    }
}
