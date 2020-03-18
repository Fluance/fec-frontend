const RESOURCE_NAME = 'dataprovider';
const ENDPOINT_NAME = RESOURCE_NAME + 's';
const ENTITY_KEY = 'id';


const run = ['config', 'DS', function(config, DS) {
    DS.defineResource({
        name: RESOURCE_NAME,
        endpoint: ENDPOINT_NAME,
        idAttribute: ENTITY_KEY,
        basePath: config.apiEHProfile,
    });
}];

dataServiceDataProviders.$inject = ['DS'];

/**
 * @ngdoc service
 * @module app.admin
 * @name dataService.dataProviders
 */
function dataServiceDataProviders(DS) {

    var service = {
        getDataProvider: getDataProvider,
        getDataProviderList: getDataProviderList
    };

    return service;

    // --------------------------------------------------------------- Interface implementation

    /**
     * @ngdoc method
     * @name dataService.dataProviders#getDataProvider
     * @param  {String}   providerId        The dataProvider ID
     * @return {Promise}                    Returns a pomise with the data provider specified by ID
     * @description
     *
     * Returns a data provider specified by ID.
     */
    function getDataProvider(providerId) {
        return DS.find(RESOURCE_NAME, providerId);
    }

    /**
     * @ngdoc method
     * @name dataService.dataProviders#getDataProviderList
     * @return {Promise}                    Returns a pomise with the list of available data providers
     * @description
     *
     * Returns a list of available data provider.
     */
    function getDataProviderList() {
        return DS.findAll(RESOURCE_NAME);
    }
}

export {
    dataServiceDataProviders,
    run
}
