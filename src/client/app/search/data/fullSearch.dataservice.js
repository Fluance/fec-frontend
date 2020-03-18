/*jshint -W101*/ //  Line too long

const RESOURCE_NAME = 'search';
const ENDPOINT_NAME = 'search';
const ENTITY_KEY = 'field';


const run = ['config', 'DS', function(config, DS) {
    DS.defineResource({
        name: RESOURCE_NAME,
        endpoint: ENDPOINT_NAME,
        idAttribute: ENTITY_KEY,
        basePath: config.apiFullTextSearch,
        bypassCache: true,
        cacheResponse: false
    });
}];


dataServiceFullSearch.$inject = ['DS', 'helpers'];

/**
 * @ngdoc service
 * @module app.core
 * @name dataService.dataProviders
 */
function dataServiceFullSearch(DS, helpers) {

    // Wire-up data services
    var resource = DS.definitions[RESOURCE_NAME];
    resource.afterFind = function(Resource, data, cb) { return _deserialize(data); };
    resource.afterFindAll = function(Resource, data) { return _deserialize(data); };

    var service = {
        search: search
    };
    return service;


    function search(searchText, entityType, offset, limit) {
        return DS.findAll(RESOURCE_NAME, {
            field: searchText,
            entityType: entityType,
            offset: offset,
            limit: limit
        });
    }

    // -------------------------------------------------------- Serialization / Deserialization

    function _deserialize(data) {
        if (_.isArray(data)) {
            // Apply deserialization on all items in the array
            data.map(function(item) { return _deserialize(item); });
        } else if (_.isObject(data)) {
            // Deserialize properties before data item is returned
            if (_.isArray(data.groups)) {
                data.groups.map(function(group) {
                    if (!_.isArray(group.data)) { return; }
                    group.data.map(function(item) {
                        helpers.toDate(item, 'admitDate');
                        helpers.toDate(item, 'birthdate');
                    });
                });
            }
        }

        return data;
    }
}

export {
    dataServiceFullSearch,
    run
}
