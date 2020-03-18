import _ from 'lodash';

const RESOURCE_NAME = 'servicefees';
const ENDPOINT = 'servicefees';
let ServiceFees, ServiceFeesDetails;

const run = ['config', 'DS', function (config, DS) {
    ServiceFees = DS.defineResource({
        name: RESOURCE_NAME,
        endpoint: ENDPOINT,
        basePath: config.apiServer,
        bypassCache: true,
        cacheResponse: false
    });
}];


dataserviceServiceFees.$inject = ['DS', '$q', 'sessionService'];

function dataserviceServiceFees(DS, $q, session) {

    var service = {
        // Properties
        sortCriteria: [
            {key: 'benefitdt', name: 'servicefee.DATE'},
            {key: 'department', name: 'servicefee.DEPARTMENT'},
            {key: 'code', name: 'servicefee.CODE'}
        ],

        groupCriteria: [
            {key: 'date', name: 'servicefee.DATE'},
            {key: 'department', name: 'servicefee.DEPARTMENT'}
        ],

        // Methods
        getServiceFeeList: getServiceFeeList,
        getServiceFeeDetails: getServiceFeeDetails,
        hasServiceFeeData: hasServiceFeeData,
        getServiceFeeCount: getServiceFeeCount,
        getServiceFeeGroupList: getServiceFeeGroupList,
        getServiceFeeGroupCount: getServiceFeeGroupCount

    }

    return service;

    function getServiceFeeList(params) {
        var deferred = $q.defer();

        var postData = {
            visitnb: params.visitnb,
            offset: params.offset,
            limit: params.limit,
            orderby: params.orderby,
            sortorder: params.sortorder,
            filterby: params.filterby,
            filtervalue: params.filtervalue
        };

        return ServiceFees.findAll(postData);
    }

    function getServiceFeeDetails(benefitId, lang) {
        var postData = {
            lang: lang
        };

        return ServiceFees.find(benefitId, postData, {
            bypassCache: true,
            cacheResponse: false,
            findStrictCache: true
        });
    }

    function hasServiceFeeData(params) {

        var postData = {
            visitnb: params.vnb
        };

        return ServiceFees
            .findAll(postData, {
                endpoint: ENDPOINT + '/count',
                bypassCache: true,
                cacheResponse: false
            })
            .then(function (data) {
                var hasData = _.isObject(data) && _.isNumber(data.count) && data.count > 0;
                return hasData;
            });
    }

    function getServiceFeeCount(params) {
        var deferred = $q.defer();

        var postData = {
            visitnb: params.visitnb,
            filterby: params.filterby,
            filtervalue: params.filtervalue
        };

        ServiceFees.findAll(postData, {
            endpoint: ENDPOINT + '/count',
            bypassCache: true,
            cacheResponse: false
        })
            .then(function (data) {
                var hasData = _.isObject(data) && _.isNumber(data.count) && data.count > 0;
                if (hasData) {
                    deferred.resolve(data.count);
                } else {
                    deferred.resolve(0);
                }
            })
            .catch(function () {
                deferred.reject();
            });

        return deferred.promise;
    }

    function getServiceFeeGroupList(params) {
        var postData = {
            visitnb: params.visitnb,
            filterby: params.filterby,
            sortorder: params.sortorder,
            offset: params.offset,
            limit: params.limit
        };

        return ServiceFees.findAll(postData, {
            endpoint: ENDPOINT + '/filters',
            bypassCache: true,
            cacheResponse: false
        });
    }

    function getServiceFeeGroupCount(params) {
        var deferred = $q.defer();

        var postData = {
            visitnb: params.visitnb,
            filterby: params.filterby,
            sortorder: params.sortorder
        };

        ServiceFees.findAll(postData, {
            endpoint: ENDPOINT + '/filters/count',
            bypassCache: true,
            cacheResponse: false
        })
            .then(function (data) {
                deferred.resolve(data);
            })
            .catch(function () {
                deferred.reject();
            });

        return deferred.promise;
    }


}


export {
    dataserviceServiceFees,
    run
};
