import moment from 'moment';
import _ from 'lodash';

helpersService.$inject = [];

/**
* @ngdoc service
* @module app.core
* @name helpersService
* @description
*
* The helpers service is a collection of utility methods (similar to underscore.js or lodash.js).
*/
function helpersService() {
    var service = {
        // JSON <-> object conversion
        jsonToObject: jsonToObject,
        objectToJson: objectToJson,

        toDate: toDate,

        // Object property manipulation
        renameProperty: renameProperty,
        addProperty: addProperty,
        removeProperty: removeProperty
    };
    return service;

    // ------------------------------------------------------------- JSON <-> object conversion

    function jsonToObject(obj, propertyName) {
        if (_.isObject(obj[propertyName])) { return; }
        obj[propertyName] = (_.isString(obj[propertyName]) && obj[propertyName].length > 0) ? JSON.parse(obj[propertyName]) : null;
    }

    function objectToJson(obj, propertyName) {
        if (_.isString(obj[propertyName])) { return; }
        obj[propertyName] = (_.isObject(obj[propertyName])) ? JSON.stringify(obj[propertyName]) : null;
    }

    // ------------------------------------------------------------- String <-> Date conversion

    function toDate(obj, propertyName) {
        if (_.isObject(obj[propertyName])) { return; }
        obj[propertyName] = (_.isNumber(obj[propertyName]) || (_.isString(obj[propertyName]) && obj[propertyName].length > 0)) ? moment(obj[propertyName]).toDate() : null;
    }

    // ------------------------------------------------------------------------- Object methods

    function renameProperty(obj, oldPropertyName, newPropertyName) {
        if (obj.hasOwnProperty(oldPropertyName)) {
            obj[newPropertyName] = obj[oldPropertyName];
            delete obj[oldPropertyName];
        }
    }

    function addProperty(obj, propertyName, propertyValue) {
        obj[propertyName] = propertyValue;
    }

    function removeProperty(obj, propertyName) {
        if (obj.hasOwnProperty(propertyName)) {
            delete obj[propertyName];
        }
    }
}

export default helpersService;
