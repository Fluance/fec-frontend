/* jshint -W117, -W030 */
describe('blocks.filter.momentFormatter', function() {

    var FORMAT = 'dd.MM.yyyy';

    var filter,
        today,
        translate,
        provide;

    beforeEach(module('app', function($provide, $translateProvider) {

        inject(['$filter', 'CacheFactory', 'moment',
            function($filter, $CacheFactory, $moment) {
                alert('injector');
                filter = $filter;
                cacheFactory = $CacheFactory;
                cacheFactory.destroyAll();
                today = $moment().format(FORMAT + ' h:mm:ss');
                alert('injectorEnd');
            }
        ]);

        alert('beforeEach');

        $provide.factory('customLoader', function($q) {
            return function() {
                var deferred = $q.defer();
                deferred.resolve({});
                return deferred.promise;
            };
        });

        $translateProvider.useLoader('customLoader');

        alert('beforeEachEnd');

    }));

    it('momentFormatter convert 2016-04-01 08:00:00 to DD (01)', function() {
        alert(filter);
        //expect(filter('formatMoment')('2016-04-01 08:00:00', 'DD')).toBe('01');
    });

});