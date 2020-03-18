/*jshint -W101*/ //  Line too long

const RESOURCE_NAME_VISIT = 'visits';

const ENDPOINT_NAME_VISIT = 'visits';
const ENDPOINT_NAME_PHYSICIAN = 'doctors';
const ENDPOINT_NAME_GUARANTOR = 'guarantors';
const ENDPOINT_NAME_POLICY = 'policies';


const run = ['config', 'DS', function(config, DS) {
    DS.defineResource({
        name: RESOURCE_NAME_VISIT,
        endpoint: ENDPOINT_NAME_VISIT,
        basePath: config.apiServer,
        relations: {
            belongsTo: {
                visit: {
                    localField: 'visit',
                    localKey: 'visitid'
                }
            }
        }
    });
}];

dataserviceVisits.$inject = ['DS', '$q', '$http', 'CacheFactory', 'config', '$translate'];

/**
 * @ngdoc service
 * @module app.visit
 * @name dataService.visits
 * @requires configProvider
 * @description
 *
 * This factory send query on visits services.<br/>
 * Server address is define in {@link configProvider#config configProvider.config.apiServer}.<br/>
 * Data are cached 5000ms (5s)
 *
 * <strong>Note:</strong> All public methods compose a post argument and call the inner method
 * {@link dataService.visits#getVisits getVisits}
 *
    angular
        .module('myModule')
        .controller('myController', ctrlFunction);

    ctrlFunction.$inject = ['dataservice.visits'];

    function ctrlFunction(visitsService) {
        visitsService.getPatientVisits(params).then(...);
        visitsService.getVisitById(vnb).then(...);
        visitsService.getPhysicianList(vnb).then(...);
        visitsService.getPolicyList(params).then(...);
        visitsService.getGuarantorList(params).then(...);
        visitsService.getPolicy(params).then(...);
        visitsService.getVisits().then(...);
    }
 *
 */

function dataserviceVisits(DS, $q, $http, $DSCacheFactory, config, $translate) {
    var DEFAULT_REQUEST_TIMEOUT = 5000; // 5s

    var baseURL = config.apiServer;
    var serviceArea = 'visits';
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
        // Properties
        sortCriteria: [
            { key: 'admitdt', name: 'core.ADMIT_DATE' }
        ],

        // Methods
        getPatientVisits: getPatientVisits,
        getVisitById: getVisitById,
        getPhysicianList: getPhysicianList,
        getGuarantorList: getGuarantorList,
        getPolicyList: getPolicyList,
        getPolicy: getPolicy,
        hasPolicyData: hasPolicyData
    };

    return service;

    /**
     * @ngdoc method
     * @name dataService.visits#getPatientVisits
     * @param {Object} params Parameters to get a list of visits for a specific patient in a specific company
     * @param {Number} params.pid Patient ID
     * @param {Number} params.companyid Company ID (optional)
     * @return {Promise}           Return a promise for a visits list for a specific patient in a specific company
     * @description
     *
     * Disassembles the params container and constructs a valid container with all post data.
     * postData will look like (companyid will be added if present in params):

        var postData = {
            pid: params.pid,
            companyid: params.companyid,
            limit: 1000,
            orderby: 'admitdt',
            sortorder: 'desc',
            offset: 0
        };

        * Then forwards the call to interal function with area set to 'list'.
     *
     */
    function getPatientVisits(params) {

        //companyid should be optional, so add if present
        var postData = {
            pid: params.pid,
            limit: 1000,
            orderby: 'admitdt',
            sortorder: 'desc',
            offset: 0
        };

        if (angular.isDefined(params.companyid)) { //search within a company
            postData.companyid = params.companyid;
        }

        if (angular.isDefined(params.openvisits)) { //search only for open visits
            postData.openvisits = params.openvisits;
        }

        if (params.limit !== undefined && params.limit !== null && params.limit !== '') {
            postData.limit = params.limit;
        }
        if (params.offset !== undefined && params.offset !== null && params.offset !== '') {
            postData.offset = params.offset;
        }
        if (params.orderby !== undefined && params.orderby !== null && params.orderby !== '') {
            postData.orderby = params.orderby;
        }
        if (params.sortorder === 'asc' || params.sortorder === 'desc') {
            postData.sortorder = params.sortorder;
        }

        return getVisits(postData, null, onMultiVisitSuccess);
    }

    /**
     * @ngdoc method
     * @name dataService.visits#getVisitById
     * @param {Number} vnb  Visit number
     * @return {Promise}           Return a promise for a single visit with the given visitId
     * @description
     *
     * Forwards the call to {@link dataService.visits#getVisits getVisits}
     * with area set to the visitId given and no post data.
     *
     */
    function getVisitById(vnb) {
        return getVisits({}, vnb, onSingleVisitSuccess);
    }

    /**
     * @ngdoc method
     * @name dataService.visits#getPhysicianList
     * @param {Number} vnb  Visit number
     * @return {Promise}           Return a promise for a list of physicians
     * treating the patient of the given visit
     * @description
     *
     * Forwards the call to {@link dataService.visits#getVisits getVisits}
     * with area set to 'doctor/list' given and the following postData:

        var postData = {
            visitnb: vnb
        };

     *
     */
    function getPhysicianList(vnb) {
        return getVisits({}, vnb + '/doctors', onMultiPhysicianSuccess);
    }

    /**
      * @ngdoc method
      * @name dataService.visits#getPolicyList
      * @param {Object} params Parameters to get a list of policies for a specific visitId
     * @param {Number} params.vnb Visit ID
      * @return {Promise}  Return a promise for a list of policies caring about the patient of the given visit
      * @description
      *
      * Forwards the call to internal function
      * with area set to 'policy/list' given and the following postData:

        var postData = {
             visitnb: params.vnb,
             limit: 10,
             orderby: 'name',
             sortorder: 'desc',
             offset: 0
        };
     *
     */
    function getPolicyList(params) {
        var postData = {
            visitnb: params.vnb,
            limit: params.limit,
            orderby: params.orderBy,
            sortorder: params.sortorder,
            offset: params.offset
        };

        if (params.limit !== undefined && params.limit !== null && params.limit !== '') {
            postData.limit = params.limit;
        }
        if (params.offset !== undefined && params.offset !== null && params.offset !== '') {
            postData.offset = params.offset;
        }
        if (params.orderby !== undefined && params.orderby !== null && params.orderby !== '') {
            postData.orderby = params.orderby;
        }
        if (params.sortorder === 'asc' || params.sortorder === 'desc') {
            postData.sortorder = params.sortorder;
        }

        return getVisits(postData, params.vnb + '/policies', onMultiPolicySuccess);
    }


    function hasPolicyData(visitId) {
        return DS
            .findAll(RESOURCE_NAME_VISIT, {}, {
                endpoint: RESOURCE_NAME_VISIT + '/' + visitId + '/' + ENDPOINT_NAME_POLICY + '/count',
                bypassCache: true,
                cacheResponse: false
            })
            .then(function(data) {
                var hasData = _.isObject(data) && _.isNumber(data.count) && data.count > 0;
                return hasData;
            })
            .catch(function(error) {
                console.error(error);
            })
    }

    /**
      * @ngdoc method
      * @name dataService.visits#getGuarantorList
      * @param {Object} params Parameters to get a list of guarantors for a specific visitId
     * @param {Number} params.vnb Visit ID
      * @return {Promise}  Return a promise for a list of
      * guarantors caring about the patient of the given visit
      * @description
      *
      * Forwards the call to internal function
      * with area set to 'guarantor/list' given and the following postData:

          var postData = {
            visitnb: params.vnb,
            limit: 10,
            orderby: 'name',
            sortorder: 'desc',
            offset: 0
          };

     *
     */
    function getGuarantorList(params) {
        var postData = {
            visitnb: params.vnb,
            limit: 10,
            orderby: params.orderBy,
            sortorder: params.sortorder,
            offset: 0
        };

        if (angular.isDefined(params)) {
            if (angular.isDefined(params.limit)) {
                postData.limit = params.limit;
            }
            if (angular.isDefined(params.offset)) {
                postData.offset = params.offset;
            }
            if (angular.isDefined(params.orderby)) {
                postData.orderby = params.orderby;
            }
            if (params.sortorder === 'asc' || params.sortorder === 'desc') {
                postData.sortorder = params.sortorder;
            }
        }

        return getVisits(postData, params.vnb + '/guarantors', onMultiGuarantorSuccess);
    }

    /**
      * @ngdoc method
      * @name dataService.visits#getPolicy
      * @param {Object} params Parameters to get single policy for the given guarantor and visit number
      * @param {Number} params.guarantorid Guarantor ID
      * @param {Number} params.priority Priority
      * @param {Number} params.subpriority Sub-Priority
      * @param {Number} params.visitnb Visit ID
      * @return {Promise}  Return a promise for a single policy for the given guarantor and visit number
      * @description
      *
      * Forwards the call to internal function
      * with area set to 'policy/detail' given and the following postData:

          var postData = {
            guarantorid: params.guarantorid,
            priority: params.priority,
            subpriority: params.subpriority,
            visitnb: params.visitnb
        };
     *
     */
    function getPolicy(params) {
        return getVisits({}, params.visitnb + '/policies/' + params.guarantorid + '/' + params.priority + '/' + params.subpriority, onSinglePolicySuccess);
    }

    /**
     * /PRIVATE METHOD/
     * @name dataService.visits#getVisits
     * @param  {Object}   postData Array holding all query arguments
     * @param {URN} serviceSubArea REST URN
     * @param {function()} successInternal Internal success function
     * @return {Promise}           Return a promise for a visits list
     * @description
     *
     * <strong>This method is only used within the dataservice itself.
     * All other methods refer to this method after composing postData
     * in the correct order and declaring the matching service area.</strong>
     * <br/><br/>
     * This method is a generic for all query methods in this service.
     *
     * Example arguments:

        var postData = {
            guarantorid: params.guarantorid,
            priority: params.priority,
            subpriority: params.subpriority,
            visitnb: params.visitnb
        };

        var serviceSubArea = 'policy/detail';

     */
    function getVisits(postData, serviceSubArea, successInternal) {
        var cacheKey = serviceSubArea + paramsToKeyString(postData);
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
            var url = baseURL + '/' + serviceArea;
            url = serviceSubArea ? url + '/' + serviceSubArea : url;
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

    /**
     * Private function
     */
    function onSingleVisitSuccess(data) {
        return data;
    }

    /**
     * Private function
     */
    function onMultiVisitSuccess(records) {
        var visits = [];
        var totalRecords = 0;

        if (records !== null && records !== '') {
            _.each(records, function(record) {
                visits.push({
                    'company': record.company,
                    'visit': {
                        'visitInfo': {
                            'admitDate': record.visitInfo.admitDate,
                            'dischargeDate': record.visitInfo.dischargeDate,
                            'patientclass': record.visitInfo.patientclass,
                            'patientclassdesc': record.visitInfo.patientclassdesc,
                            'patienttype': record.visitInfo.patienttype,
                            'patienttypedesc': record.visitInfo.patienttypedesc,
                            'patientcase': record.visitInfo.patientcase,
                            'patientcasedesc': record.visitInfo.patientcasedesc,
                            'hospservice': record.visitInfo.hospservice,
                            'hospservicedesc': record.visitInfo.hospservicedesc,
                            'admissiontype': record.visitInfo.admissiontype,
                            'admissiontypedesc': record.visitInfo.admissiontypedesc,
                            'patientUnit': record.visitInfo.patientunit,
                            'patientUnitDesc': record.visitInfo.patientunitdesc,
                            'financialClass': record.visitInfo.financialclass,
                            'financialClassDesc': record.visitInfo.financialclassdesc,
                            'attendingPhysicianLastname': record.visitInfo.attendingPhysicianLastname,
                            'attendingPhysicianFirstname': record.visitInfo.attendingPhysicianFirstname,
                            'number': record.visitInfo.number
                        }
                    },
                    'nbRecords': record.nbRecords
                });
            });
            totalRecords = visits[0] ? visits[0].nbRecords : 0;
        }

        return {
            visits: visits,
            totalRecords: totalRecords
        };
    }

    /**
     * Private function
     */
    function onMultiPhysicianSuccess(data) {
        return data[0];
    }

    /**
     * Private function
     */
    function onMultiPolicySuccess(data) {

        return {
            policies: data,
            totalRecords: data.length
        };
    }

    /**
     * Private function
     */
    function onMultiGuarantorSuccess(data) {

        var mwAdapter = [];
        _.each(data, function(guarantor) {
            mwAdapter.push({
                'guarantor_id': guarantor['guarantor_id'],
                'name': guarantor.name,
                'code': guarantor.code,
                'address': guarantor.address,
                'address2': guarantor.address2,
                'locality': guarantor.locality,
                'postcode': guarantor.postcode,
                'canton': guarantor.canton,
                'country': guarantor.country,
                'comments': guarantor.comments,
                'complement': guarantor.complement,
                'begindate': guarantor.begindate,
                'occasional': guarantor.occasional,
                'enddate': guarantor.enddate
            });
        });
        data = mwAdapter;

        return {
            guarantors: data,
            totalRecords: data.length
        };
    }

    /**
     * Private function
     */
    function onSinglePolicySuccess(data) {
        return data;
    }
}

export {
    dataserviceVisits,
    run
}
