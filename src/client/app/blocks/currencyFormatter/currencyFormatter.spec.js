// jscs:disable requireParenthesesAroundIIFE
/* jshint -W117, -W030 */
describe('blocks.filter.currencyFormatter', function() {
    var filter;

    beforeEach(function() {
        module('app');
        inject(['$filter', 'CacheFactory',
            function($filter, $CacheFactory) {
                filter = $filter('formatCurrency');
                $CacheFactory.destroyAll();
            }
        ]);
    });

    // Test to match an empty input
    it('formatCurrency should be ""', function() {
        expect(filter('')).toMatch('');
    });

    // Test to match isNan(input)
    it('formatCurrency should be "hello"', function() {
        expect(filter('hello')).toBe('hello');
    });

    // Test to match a negativ value with an undefined symbol
    it('dataValidator should match "."', function() {
        expect(filter(-1000)).toBe('undefined - 1\'000.00');
    });

    // Test to match a negativ value with a defined symbol
    it('dataValidator should match "."', function() {
        expect(filter(-1000, 'CH', '\'')).toBe('CH - 1\'000.00');
    });

    // Test to match a positive value with a defined symbol without a defined place
    it('dataValidator should match " ."', function() {
        expect(filter(1000, 'CH')).toBe('CH 1\'000.00');
    });

    // Test to match a positive value with a defined symbol with a defined place
    it('dataValidator should match " ."', function() {
        expect(filter(1000, 'CH', '\'', 'Schwitzerland')).toBe('1\'000.00 CH');
    });
});
