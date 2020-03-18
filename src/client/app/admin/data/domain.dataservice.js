/*jshint -W101*/ //  Line too long

const RESOURCE_NAME = 'domain';
const ENDPOINT_NAME = 'domains';


const run = ['config', 'DS', function(config, DS) {
    DS.defineResource({
        name: RESOURCE_NAME,
        endpoint: ENDPOINT_NAME,
        basePath: config.apiEHProfile
    });
}];

dataServiceDomain.$inject = ['$q', 'DS', 'helpers'];

/**
 * @ngdoc service
 * @module app.admin
 * @name dataService.beds
 */
function dataServiceDomain($q, DS, helpers) {

    // Wire-up data services
    var resource = DS.definitions[RESOURCE_NAME];
    resource.afterFind = function(Resource, data, cb) { return _deserialize(data); };
    resource.afterFindAll = function(Resource, data) { return _deserialize(data); };

    var service = {
        getDomainList: getDomainList
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
    function getDomainList() {
        var endpoint = 'identity/' + ENDPOINT_NAME;
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
                'name': data
            };
        }

        return data;
    }
}

export {
    dataServiceDomain,
    run
}
