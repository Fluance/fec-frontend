/*jshint -W101*/ //  Line too long
import _ from 'lodash';

const RESOURCE_NAME = 'hospService';
const ENDPOINT_NAME = 'services';

const run = ['config', 'DS', function(config, DS) {
    DS.defineResource({
        name: RESOURCE_NAME,
        endpoint: ENDPOINT_NAME,
        basePath: config.apiServer,
        relations: {
            belongsTo: {
                company: {
                    localField: 'company',
                    localKey: 'companyId',
                    parent: true
                }
            }
        }
    });
}];


dataServiceHospServices.$inject = ['$q', 'DS', 'helpers'];

/**
 * @ngdoc service
 * @module app.core
 * @name dataService.hospServices
 */
function dataServiceHospServices($q, DS, helpers) {

    // Wire-up data services
    var resource = DS.definitions[RESOURCE_NAME];
    resource.afterFind = function(Resource, data, cb) { return _deserialize(data); };
    resource.afterFindAll = function(Resource, data) { return _deserialize(data); };

    var service = {
        getServiceList: getServiceList,
        getServiceListCount: getServiceListCount
    };

    return service;

    // ---------------------------------------------------------------------------------- Rooms

    /**
     * @ngdoc method
     * @name dataService.hospServices#getServiceList
     * @param  {Number}   companyId         Company ID
     * @param  {String=}  unitCode          The code of the unit
     * @return {Promise}                    Returns a pomise with the list of hosp-services
     * @description
     *
     * Returns a list of hosp-services for the specified unit of a certain company.
     */
    function getServiceList(companyId, unitCode) {
        // Validate
        if (!_.isNumber(companyId)) { return $q.reject('Missing argument companyId.'); }

        return DS
            .findAll(RESOURCE_NAME, {
                companyId: companyId,
                patientunit: unitCode
            }, {
                bypassCache: true,
                cacheResponse: false
            });
    }

    /**
     * @ngdoc method
     * @name dataService.services#getServiceListCount
     * @param  {Number}   companyId         Company ID
     * @param  {Array=}   hospServices      The list of code of the hospService
     * @return {Promise}                    Returns a promise with the list of services with counts
     * @description
     *
     * Returns a list of services with counts for the specified hospService of a certain company.
     */
    function getServiceListCount(companyId, hospServices) {
        // Validate
        if (!_.isNumber(companyId)) { return $q.reject(new Error('Missing argument companyId')); }

        return DS
            .findAll(RESOURCE_NAME, {
                companyId: companyId,
                hospservice: hospServices
            }, {
                bypassCache: true,
                cacheResponse: false
            })
            .catch(function(exception) {
                return $q.reject(exception.data);
            });
    }

    // -------------------------------------------------------- Serialization / Deserialization

    function _deserialize(data) {
        if (_.isArray(data)) {
            // Apply deserialization on all items in the array
            data.map(function(item) { return _deserialize(item); });
        } else if (_.isObject(data)) {
            // Deserialize properties before data item is returned
            helpers.renameProperty(data, 'hospService', 'code');
            helpers.renameProperty(data, 'hospServiceDesc', 'codeDesc');
        }

        return data;
    }
}

export {
    dataServiceHospServices,
    run
};
