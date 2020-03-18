/*jshint -W101*/ //  Line too long
import _ from 'lodash';

const RESOURCE_NAME = 'bed';
const ENDPOINT_NAME = 'beds';

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


dataServiceBeds.$inject = ['$q', 'DS', 'helpers'];

/**
 * @ngdoc service
 * @module app.core
 * @name dataService.beds
 */
function dataServiceBeds($q, DS, helpers) {

    // Wire-up data services
    var resource = DS.definitions[RESOURCE_NAME];
    resource.afterFind = function(Resource, data, cb) { return _deserialize(data); };
    resource.afterFindAll = function(Resource, data) { return _deserialize(data); };

    var service = {
        getBedList: getBedList
    };

    return service;

    // --------------------------------------------------------------- Interface implementation

    /**
     * @ngdoc method
     * @name dataService.beds#getBedList
     * @param  {Number}   companyId         Company ID
     * @param  {String}   roomNumber        The value indicating whether to return only occupied rooms (with at least one patient)
     * @param  {String=}  hospServiceCode   The code of the hospService
     * @param  {String=}  unitCode          The code of the unit
     * @return {Promise}                    Returns a pomise with the list of rooms
     * @description
     *
     * Returns a list of beds for the specified room of a certain company.
     */
    function getBedList(companyId, roomNumber, hospServiceCode, unitCode) {
        // Validate
        if (!_.isNumber(companyId)) { return $q.reject(new Error('Missing argument companyId')); }
        if (!_.isString(roomNumber)) { return $q.reject(new Error('Missing argument roomNumber')); }

        return DS
            .findAll(RESOURCE_NAME, {
                companyId: companyId,
                hospservice: hospServiceCode,
                patientroom: roomNumber,
                patientunit: unitCode
            }, {
                bypassCache: true,
                cacheResponse: false
            });
    }

    // -------------------------------------------------------- Serialization / Deserialization

    function _deserialize(data) {
        if (_.isArray(data)) {
            // Apply deserialization on all items in the array
            data.map(function(item) { return _deserialize(item); });
        } else if (_.isObject(data)) {
            // Deserialize properties before data item is returned
            helpers.renameProperty(data, 'patientBed', 'bedNumber');
        }

        return data;
    }
}

export {
    dataServiceBeds,
    run
};
