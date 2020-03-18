// jscs:disable requireParenthesesAroundIIFE
/* jshint -W117, -W030 */
describe('blocks.filter.firstletter', function() {
    var filter;

    beforeEach(function() {
        module('app');
        inject(['$filter', 'CacheFactory',
            function($filter, $CacheFactory) {
                filter = $filter('firstLetter');
                $CacheFactory.destroyAll();
            }
        ]);
    });

    // Test to match the first letter of an input
    it('firstLetter should match "h"', function() {
        expect(filter('hello')).toMatch('h');
    });

    // Test to match if two values are given it should return the first letter and a point
    it('dataValidator should match "h."', function() {
        expect(filter('hello', '.')).toMatch('h.');
    });

    // The empty value and a point it should return a point
    it('dataValidator should match "."', function() {
        expect(filter('', '.')).toMatch('.');
    });

    // Test space and point, it should return a space and a point
    it('dataValidator should match " ."', function() {
        expect(filter(' ', '.')).toMatch(' .');
    });

    // Test if the seconde value always return a point
    it('dataValidator should match "H.', function() {
        expect(filter('Hi', 'mario')).toMatch('H.');
    });
});
