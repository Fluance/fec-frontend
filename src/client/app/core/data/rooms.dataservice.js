/*jshint -W101*/ //  Line too long
import _ from 'lodash';

const RESOURCE_NAME = 'room';
const ENDPOINT_NAME = 'rooms';

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


dataServiceRooms.$inject = ['$q', 'DS', 'helpers'];

/**
 * @ngdoc service
 * @module app.core
 * @name dataService.rooms
 */
function dataServiceRooms($q, DS, helpers) {

    // Wire-up data services
    var resource = DS.definitions[RESOURCE_NAME];
    resource.afterFind = function(Resource, data, cb) { return _deserialize(data); };
    resource.afterFindAll = function(Resource, data) { return _deserialize(data); };

    var service = {
        getRoomList: getRoomList
    };

    return service;

    // --------------------------------------------------------------- Interface implementation

    /**
     * @ngdoc method
     * @name dataService.rooms#getRoomList
     * @param  {Number}   companyId         Company ID
     * @param  {String=}  hospServiceCode   The code of the hospService
     * @param  {String=}  unitCode          The code of the unit
     * @param  {String=}  patientclass      The type of the patient 'I'/'O'
     * @param  {Boolean=} [occupancy=false] The value indicating whether to return only occupied rooms (with at least one patient)
     * @return {Promise}                    Returns a pomise with the list of rooms
     * @description
     *
     * Returns a list of rooms for the specified hospService or unit of a certain company.
     */
    function getRoomList(companyId, hospService, unit, occupancy, patientclass) {
        // Validate
        if (!_.isNumber(companyId)) { return $q.reject(new Error('Missing argument companyId')); }

        return DS
            .findAll(RESOURCE_NAME, {
                companyId: companyId,
                hospservice: hospService,
                occupancy: occupancy,
                patientclass: patientclass,
                patientunit: unit
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
            helpers.renameProperty(data, 'patientRoom', 'roomNumber');
        }

        return data;
    }
}

export {
    dataServiceRooms,
    run
};
