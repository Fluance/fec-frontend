/*jshint -W101*/ //  Line too long
import _ from 'lodash';

const RESOURCE_NAME = 'company';
const ENDPOINT_NAME = 'companies';
const RESOURCE_NAME_DETAIL = 'company.detail';
const ENDPOINT_NAME_DETAIL = 'companies';
const ENTITY_KEY = 'id';

const run =['config', 'DS', function(config, DS) {
    DS.defineResource({
        name: RESOURCE_NAME,
        endpoint: ENDPOINT_NAME,
        idAttribute: ENTITY_KEY,
        basePath: config.apiServer
    });
    DS.defineResource({
        name: RESOURCE_NAME_DETAIL,
        endpoint: ENDPOINT_NAME_DETAIL,
        idAttribute: ENTITY_KEY,
        basePath: config.apiServer
    });
}];


dataServiceCompanies.$inject = ['$q', 'DS', 'helpers'];

/**
 * @ngdoc service
 * @module app.core
 * @name dataService.companies
 * @requires configProvider
 */
function dataServiceCompanies($q, DS, helpers) {

    // Wire-up data services
    var resource = DS.definitions[RESOURCE_NAME];
    resource.afterFind = function(Resource, data, cb) { return _deserialize(data); };
    resource.afterFindAll = function(Resource, data) { return _deserialize(data); };
    var resource = DS.definitions[RESOURCE_NAME_DETAIL];
    resource.afterFind = function(Resource, data, cb) { return _deserializeDetail(data); };

    var service = {
        getCompanyList: getCompanyList,
        getCompanyDetail: getCompanyDetail
    };

    return service;

    // --------------------------------------------------------------- Interface implementation

    /**
     * @ngdoc method
     * @name dataService.companies#getCompanyList
     * @return {Promise}                    Returns a pomise with the list of company info objects
     * @description
     *
     * Returns a list of company info onjects.
     */
    function getCompanyList() {
        return DS.findAll(RESOURCE_NAME);
    }

    /**
     * @ngdoc method
     * @name dataService.companies#getCompanyDetail
     * @param  {Number}   companyId         Company ID
     * @return {Promise}                    Returns a pomise with the company
     * @description
     *
     * Returns the specified company by ID.
     */
    function getCompanyDetail(companyId) {
        // Validate
        if (!_.isNumber(companyId)) { return $q.reject('Missing argument companyId.'); }

        return DS.find(RESOURCE_NAME_DETAIL, companyId);
    }

    // -------------------------------------------------------- Serialization / Deserialization

    function _deserializeDetail(data) {
        if (_.isObject(data)) {
            // rename 'logo' to 'logoFilename'
            if(_.isString(data['logo'])) {
                helpers.renameProperty(data, 'logo', 'logoFilename');
            }
        }

        return data;
    }

    function _deserialize(data) {
        if (_.isArray(data)) {
            // Apply deserialization on all items in the array
            data.map(function(item) { return _deserialize(item); });
        } else if (_.isObject(data)) {
            // Deserialize properties before data item is returned
            helpers.renameProperty(data, 'staffids', 'staffInfos');

            // rename 'logo' to 'logoFilename'
            if(_.isString(data['logo'])) {
                helpers.renameProperty(data, 'logo', 'logoFilename');
            }

            _deserializeHospServices(data.hospServices);
            _deserializeUnits(data.units);
        }

        return data;
    }

    function _deserializeHospServices(data) {
        if (_.isArray(data)) {
            // Apply deserialization on all items in the array
            data.map(function(item) { return _deserializeHospServices(item); });
        } else if (_.isObject(data)) {
            // Deserialize properties before data item is returned
            helpers.renameProperty(data, 'hospService', 'code');
            helpers.renameProperty(data, 'hospServiceDesc', 'codeDesc');
        }

        return data;
    }

    function _deserializeUnits(data) {
        if (_.isArray(data)) {
            // Apply deserialization on all items in the array
            data.map(function(item) { return _deserializeUnits(item); });
        } else if (_.isObject(data)) {
            // Deserialize properties before data item is returned
            helpers.renameProperty(data, 'patientUnit', 'code');
        }

        return data;
    }
}

export {
    dataServiceCompanies,
    run
};
