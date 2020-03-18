/*jshint -W101*/ //  Line too long

dataserviceLab.$inject = ['$q', '$http', 'CacheFactory', 'logger', 'config'];

/**
 * @ngdoc service
 * @module app.lab
 * @name dataService.lab
 * @requires logger
 * @requires configProvider
 * @description
 *
 * This factory sends queries on lab services.<br/>
 * Server address is define in {@link configProvider#config configProvider.config.apiServer}.<br/>
 * Data are cached 5000ms (5s)
 *
    angular
        .module('myModule')
        .controller('myController', ctrlFunction);

    ctrlFunction.$inject = ['dataservice.lab'];

    function ctrlFunction(labService) {
        labService.getLabCategories(patientId).then(...);
        labService.getLabDatasByCategory(patientId, categoryId).then(...);
    }

 *
 */
function dataserviceLab($q, $http, $DSCacheFactory, logger, config) {
    var DEFAULT_REQUEST_TIMEOUT = 5000; // 5s

    var baseURL = config.apiServer;
    var serviceArea = 'patients'; // TODO: Set the service area
    var cache = $DSCacheFactory(serviceArea + '/lab');
    var apiRequestTimeout = config.apiRequestTimeout || DEFAULT_REQUEST_TIMEOUT;
    cache.setOptions({
        maxAge: 5000, // 5sec
        deleteOnExpire: 'aggressive'
    });
    if ($DSCacheFactory.cacheOn === false) {
        cache.disable();
    }

    var service = {
        getLabCategories: getLabCategories,
        getLabDatasByCategory: getLabDatasByCategory,
        hasLabData: hasLabData
    };

    return service;



    /**
    * @ngdoc method
    * @name dataService.lab#getLabCategories
    * @param {Number} [pid] [Patient ID]
    * @return {Promise}         Return a promise
    * @description
    *
    * Return a list of lab categories

       labService
           .getLabCategories(pid)
           .then(function (categories) {
               // List of lab categories
           })
           .catch(function(exception) {
               // Behave like an error occured
           });

    *
    */
    function getLabCategories(pid) {
        var postData = {
            pid: pid
        };

        return getDatas(postData, pid + '/lab/groupnames', onMultipleCategoriesSuccess);
    }

    function onMultipleCategoriesSuccess(data) {
        data = _.filter(data, function(category) {
            if (!!category.groupName) {
                return category;
            }
        });
        var counter = 0;
        var returnValue = [];
        data.sort(sortByGroupname);
        data.forEach(function(category) {
            returnValue.push({
                'id': counter,
                'name': category.groupName,
                'has_nm': false
            });
            counter++;
        });
        return returnValue;
    }


    /**
     * @ngdoc method
     * @name dataService.lab#getLabDatasByCategory
     * @param {Number} [pid] [Patient ID]
     * @param {Number} [category] [Patient ID]
     * @return {Promise}         Return a promise
     * @description
     *
     * Return a list of lab result matching a category

        labService
            .getLabDatasByCategory(pid)
            .then(function (result) {
                // List of lab result
            })
            .catch(function(exception) {
                // Behave like an error occured
            });

     *
     */
    function getLabDatasByCategory(pid, category) {
        var postData = {
            pid: pid,
            groupname: category
        };

        return getDatas(postData, pid + '/lab', onMultipleLabSuccess);
    }

    function hasLabData(pid) {
        return getDatas({}, pid + '/lab/count', function(data) {
            return _.isObject(data) && _.isNumber(data.count) && (data.count > 0);
        });
    }

    /**
     * Private function
     */
    function onMultipleLabSuccess(data) {
        var mwAdapter = [];
        _.each(data, function(lab) {
            mwAdapter.push({
                'analysisname': lab.analysisName,
                'value': lab.value,
                'valuetype': lab.valueType,
                'unit': lab.unit,
                'refrange': lab.refrange,
                'abnormalflag': lab.abnormalFlag,
                'abnormalflagdesc': lab.abnormalFlagDesc,
                'resultstatus': lab.resultStatus,
                'resultstatusdesc': lab.resultStatusDesc,
                'comments': lab.comments,
                'pid': lab.pid,
                'groupname': lab.groupName,
                'observationdate': lab.observationDate
            });
        });
        data = mwAdapter;
        return data;
    }

    /**
     * Private function
     */
    function getDatas(postData, serviceSubArea, successInternal) {
        var cacheKey = serviceSubArea + paramsToKeyString(postData);
        if (cache.get(cacheKey) !== undefined) {
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
            var url = baseURL + '/' + serviceArea + '/' + serviceSubArea;
            $http({
                method: 'get',
                url: url,
                params: postData,
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

    /**
     * Private function
     */
    function paramsToKeyString(obj) {
        var str = '';
        for (var p in obj) {
            if (obj.hasOwnProperty(p)) {
                str += p + '/' + obj[p] + '/';
            }
        }
        return str;
    }

    function sortByGroupname(a, b) {
        if (a.groupname < b.groupname) {
            return -1;
        }
        if (a.groupname > b.groupname) {
            return 1;
        }
        return 0;
    }

}

export default dataserviceLab;
