import {Maps} from 'utils/maps';

describe('Maps', function() {
    it('clone', function() {
        let map = new Map(),
            maps = new Maps();
        map.set('a', 'b');

        expect(maps.clone(map)).toEqual(map);
        expect(maps.clone(map)).not.toBe(map);
    });

    it('sum', function() {
        let map  = new Map(),
            map2 = new Map(),
            map3 = new Map(),
            maps = new Maps();
        map.set('a', 'b');
        map2.set('c', 'd');
        map3.set('a', 'b');
        map3.set('c', 'd');

        expect(maps.sum(map, map2)).toEqual(map3);
    });
});
