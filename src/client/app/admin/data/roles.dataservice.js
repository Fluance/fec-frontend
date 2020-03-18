/*jshint -W101*/ //  Line too long

const RESOURCE_NAME = 'roles';
const ENDPOINT_NAME = 'roles';
const READONLY_ROLE = 'everyone';


const run = ['config', 'DS', function(config, DS) {
    DS.defineResource({
        name: RESOURCE_NAME,
        endpoint: ENDPOINT_NAME,
        basePath: config.apiEHProfile
    });
}];

dataServiceRoles.$inject = ['$q', 'DS', 'helpers'];

/**
 * @ngdoc service
 * @module app.admin
 * @name dataService.roles
 */
function dataServiceRoles($q, DS, helpers) {

    // Wire-up data services
    var resource = DS.definitions[RESOURCE_NAME];
    resource.afterFindAll = function(Resource, data) { return _deserialize(data); };

    var service = {
        getRolesList: getRolesList
    };

    return service;

    // --------------------------------------------------------------- Interface implementation

    /**
     * @ngdoc method
     * @name dataService.domain#getDomainList
     * @return {Promise}                    Returns a pomise with the list of rooms
     * @description
     *
     * Returns a list of beds for the specified room of a certain company.
     */
    function getRolesList() {
        var endpoint = 'admin/' + ENDPOINT_NAME;

        return DS
            .findAll(RESOURCE_NAME, {}, {
                endpoint: endpoint,
                bypassCache: true,
                cacheResponse: false
            });
    }

    // -------------------------------------------------------- Serialization / Deserialization

    function _deserialize(data) {
        if (_.isArray(data)) {
            // Apply deserialization on all items in the array
            data = data.map(function(item) { return _deserialize(item); });
        } else {

            data = {
                'name': data,
                'readonly': READONLY_ROLE === data
            };
        }

        return data;
    }
}

export {
    dataServiceRoles,
    run
}
