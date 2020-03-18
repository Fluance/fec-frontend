/*jshint -W101*/ //  Line too long
import _ from 'lodash';

const RESOURCE_NAME = 'unit';
const ENDPOINT_NAME = 'units';

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


dataServiceUnits.$inject = ['$q', 'DS', 'helpers'];

/**
 * @ngdoc service
 * @module app.core
 * @name dataService.units
 */
function dataServiceUnits($q, DS, helpers) {

    // Wire-up data services
    var resource = DS.definitions[RESOURCE_NAME];
    resource.afterFind = function(Resource, data, cb) { return _deserialize(data); };
    resource.afterFindAll = function(Resource, data) { return _deserialize(data); };

    var service = {
        getUnitList: getUnitList,
        getUnitListCount: getUnitListCount
    };

    return service;

    // --------------------------------------------------------------- Interface implementation

    /**
     * @ngdoc method
     * @name dataService.units#getUnitsList
     * @param  {Number}   companyId         Company ID
     * @return {Promise}                    Returns a pomise with the list of units
     * @description
     *
     * Returns a list of units for the specified company.
     */
    function getUnitList(companyId) {
        // Validate
        if (!_.isNumber(companyId)) { return $q.reject(new Error('Missing argument companyId')); }

        return DS
            .findAll(RESOURCE_NAME, {
                companyId: companyId
            }, {
                bypassCache: true,
                cacheResponse: false
            })
            .catch(function(exception) {
                return $q.reject(exception.data);
            });
    }

    /**
     * @ngdoc method
     * @name dataService.units#getUnitListCount
     * @param  {Number}   companyId         Company ID
     * @param  {Array=}   units             The list of codes of the units
     * @return {Promise}                    Returns a promise with the list of units with counts
     * @description
     *
     * Returns a list of units with counts for the specified units of a certain company.
     */
    function getUnitListCount(companyId, units) {
        // Validate
        if (!_.isNumber(companyId)) { return $q.reject(new Error('Missing argument companyId')); }

        return DS
            .findAll(RESOURCE_NAME, {
                companyId: companyId,
                patientunit: units
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
            helpers.renameProperty(data, 'patientUnit', 'code');
        }

        return data;
    }
}

export {
    dataServiceUnits,
    run
};
