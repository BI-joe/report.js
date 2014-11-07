export class Maps {

    clone(map) {
        let newMap = new Map();
        map.forEach((value, key) => {
            newMap.set(key, value);
        });

        return newMap;
    }

    sum(map1, map2) {
        let newMap = new Map();
        map1.forEach((value, key) => {
            newMap.set(key, value);
        });
        map2.forEach((value, key) => {
            newMap.set(key, value);
        });

        return newMap;
    }
}
