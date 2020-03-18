const RESOURCE_NAME = 'medlab';
const ENDPOINT_NAME = RESOURCE_NAME;
const ENTITY_KEY = 'vnb';

const run = ['config', 'DS', function(config, DS) {
    DS.defineResource({
        name: RESOURCE_NAME,
        endpoint: ENDPOINT_NAME,
        basePath: config.apiServer,
        idAttribute: ENTITY_KEY
    });
}];

dataServiceMedLab.$inject = ['$q', 'DS'];

/**
 * @ngdoc service
 * @module medlab
 * @name dataService.medlab
 */
function dataServiceMedLab($q, DS) {
    var service = {
        // Contstants
        OBJECT_TYPE_MEDLAB: 'MedLab',

        // Methods
        getUrl: getUrl
    };

    return service;

    /**
     * @ngdoc method
     * @name dataService.medlab#getUrl
     * @param  {Number}   visitNb           Visit number
     * @return {Promise}                    Returns the url for the specified visit
     * @description
     *
     * Returns a the url for the specified visit.
     */
    function getUrl(visitNb) {
        // Validate
        if (!_.isNumber(visitNb)) { return $q.reject('Missing argument visitNb.'); }

        return DS
            .find(RESOURCE_NAME, visitNb,
                {
                    bypassCache: true,
                    cacheResponse: false
                })
            .then(function(data) {
                return data.url;
            });
    }
}

export {
    dataServiceMedLab,
    run
};
