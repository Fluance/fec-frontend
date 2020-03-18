/*jshint -W101*/ //  Line too long

dataServiceMeteo.$inject = ['$q', '$http', 'CacheFactory', 'config'];

/**
 * @ngdoc service
 * @module app.core
 * @name dataService.meteo
 * @requires configProvider
 * @description
 *
 * This factory send query on guarantors.<br/>
 * Server address is define in {@link configProvider#config configProvider.config.apiServer}.<br/>
 * Data are cached 5000 ms (5s)
 */
function dataServiceMeteo($q, $http, $DSCacheFactory, config) {
    var baseURL = config.apiMeteoData ? config.apiMeteoData : '';
    var serviceArea = 'weather/meteodata';
    var cache = $DSCacheFactory(serviceArea);
    cache.setOptions({
        maxAge: 5000, // 5sec
        deleteOnExpire: 'aggressive'
    });
    if (config.cache === false) {
        cache.disable();
    }

    var service = {
        getMeteoDay: getMeteoDay,
        getMeteoPreview: getMeteoPreview
    };

    return service;

    function getMeteoDay(companyId, date) {
        var url = baseURL + '/' + serviceArea + '/' + companyId;
        return $http({
            method: 'get',
            url: url,
            params: {
                date: date
            },
            timeout: 5000
        });
    }

    function getMeteoPreview(companyId, previewDate) {
        var url = baseURL + '/' + serviceArea + '/dailyoverview/' + companyId;
        return $http({
            method: 'get',
            url: url,
            params: {
                date: previewDate,
            },
            timeout: 5000
        });
    }
}

export default dataServiceMeteo;
