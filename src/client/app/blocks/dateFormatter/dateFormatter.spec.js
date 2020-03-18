/* jshint -W117, -W030 */
describe('blocks.filter.dateFormatter', function() {

    var FORMAT = 'dd.MM.yyyy';

    var filter,
        cacheFactory,
        today;

    beforeEach(function() {
        module('app');
        inject(['$filter', 'CacheFactory', 'moment',
            function($filter, $CacheFactory, $moment) {
                filter = $filter;
                cacheFactory = $CacheFactory;
                cacheFactory.destroyAll();
                today = $moment().format(FORMAT + ' h:mm:ss');
            }
        ]);

    });

    // Limit values

    it('dateFormatter convert 1970-01-01 00:00:00 to ' + FORMAT, function() {
        expect(filter('formatDate')('1970-01-01 00:00:00','date')).toBe('01.01.1970');
    });

    // Test the two described test cases

    it('dateFormatter convert yyyy-MM-dd hh:mm:ss to ' + FORMAT, function() {
        expect(filter('formatDate')('2015-09-28 00:00:00','date')).toBe('28.09.2015');
    });

    it('dateFormatter convert yyyy-MM-dd to ' + FORMAT, function() {
        expect(filter('formatDate')('1960-05-05','date')).toBe('05.05.1960');
    });

    // Test special formats

    it('dateFormatter convert yyyy-MM-dd to dd-MM-yyyy', function() {
        expect(filter('formatDate')('1960-05-05', 'dd-MM-yyyy')).toBe('05-05-1960');
    });

    it('dateFormatter convert yyyy-MM-dd to yyyy-MM-dd', function() {
        expect(filter('formatDate')('1960-05-05', 'yyyy-MM-dd')).toBe('1960-05-05');
    });

    // Check simple return when entering not a date

    it('dateFormatter return invalid date unchanged', function() {
        expect(filter('formatDate')('OfCourseNotADate')).toBe('OfCourseNotADate');
    });

});
