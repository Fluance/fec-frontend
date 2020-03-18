/*jshint -W101*/ //  Line too long

dataServiceGuarantors.$inject = ['$q', '$http', 'CacheFactory', 'config'];

/**
 * @ngdoc service
 * @module app.guarantor
 * @name dataService.guarantors
 * @requires configProvider
 * @description
 *
 * This factory send query on guarantors.<br/>
 * Server address is define in {@link configProvider#config configProvider.config.apiServer}.<br/>
 * Data are cached 5000 ms (5s)
 *
    angular
        .module('myModule')
        .controller('myController', ctrlFunction);

    ctrlFunction.$inject = ['dataservice.guarantors'];

    function ctrlFunction(guarantorService) {
        guarantorService.getGuarantorDetails(guarantorId).then(...);        }

         *
 */
function dataServiceGuarantors($q, $http, $DSCacheFactory, config) {
    var DEFAULT_REQUEST_TIMEOUT = 5000; // 5s

    var baseURL = config.apiServer;
    var serviceArea = 'guarantors';
    var cache = $DSCacheFactory(serviceArea);
    var apiRequestTimeout = config.apiRequestTimeout || DEFAULT_REQUEST_TIMEOUT;
    cache.setOptions({
        maxAge: 5000, // 5sec
        deleteOnExpire: 'aggressive'
    });
    if (config.cache === false) {
        cache.disable();
    }

    var service = {
        getGuarantorDetails: getGuarantorDetails
    };

    return service;

    /**
     * @ngdoc method
     * @name dataService.guarantors#getGuarantorDetails
     * @param {Number} visitid Visit ID
     * @param {Number} guarantorid Guarantor ID
     * @return {Promise}         Return a promise
     * @description
     *
     * Return a singe guarantors details

        guarantorService
            .getGuarantorDetails()
            .then(function (guarantor) {
                // guarantor payload
            })
            .catch(function(exception) {
                // Behave like an error occured
            });

     * `guarantor` variable returns details to the given id.
     */
    function getGuarantorDetails(visitid, guarantorid) {
        return getGuarantors(visitid, '' + guarantorid, onSingleGuarantorSuccess);
    }

    /**
     * Private function
     */
    function onSingleGuarantorSuccess(data) {
        return data;
    }

    /**
     * Private function
     */
    function getGuarantors(visitId, serviceSubArea, successInternal) {
        var cacheKey = serviceSubArea;
        if (config.cache && cache.get(cacheKey) !== undefined) {
            return $q(function(resolve, reject) {
                try {
                    var result = successInternal(cache.get(cacheKey));
                    resolve(result);
                } catch (error) {
                    reject(error);
                }

            });
        } else {
            var deferred = $q.defer();
            var url = baseURL + '/visits/' + visitId + '/' + serviceArea + '/' + serviceSubArea;
            $http({
                method: 'get',
                url: url,
                timeout: apiRequestTimeout
            }).then(function(response) {
                try {
                    var result = successInternal(response.data);
                    cache.put(cacheKey, response.data);
                    deferred.resolve(result);
                } catch (error) {
                    error.response = response.data;
                    deferred.reject(error);
                }
            }).catch(function(exception) {
                deferred.reject(exception);
            });
            return deferred.promise;
        }
    }
}

export default dataServiceGuarantors;
