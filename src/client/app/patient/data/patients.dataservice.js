/*jshint -W101*/ //  Line too long

const RESOURCE_NAME = 'patient';
const ENDPOINT_NAME = 'patients';
const ENTITY_KEY = 'pid';


const run = ['config', 'DS', function(config, DS) {
    DS.defineResource({
        name: RESOURCE_NAME,
        endpoint: ENDPOINT_NAME,
        idAttribute: ENTITY_KEY,
        basePath: config.apiServer
    });
}];

dataServicePatients.$inject = ['$q', '$http', 'logger', 'moment', 'CacheFactory', 'config', 'DS'];

/**
 * @ngdoc service
 * @module app.patient
 * @name dataService.patients
 * @requires logger
 * @requires configProvider
 * @description
 *
 * This factory send query on patients services. </br>
 * Server address is define in {@link configProvider#config configProvider.config.apiServer}.</br>
 * Data are cached for 5000ms (5s)
 *
 * <strong>Note:</strong> All public methods compose a post argument and call the inner method `getPatients()`
 *
    angular
        .module('myModule')
        .controller('myController', ctrlFunction);

    ctrlFunction.$inject = ['dataservice.patients'];

    function ctrlFunction(patientService) {
        patientService.getPatientByCriteria(params).then();
        patientService.getPatientByPid(params).then();
        patientService.getPatientByVnb(params).then();
        patientService.getPatientByLocation(params).then();
        patientService.getPatientDetail(pid).then();
        patientService.getPatientByUnit(params).then();
        patientService.getPatientByService(params).then();
        patientService.getPatientForPhysician(params).then();
    }

*
*/

function dataServicePatients($q, $http, logger, moment, $DSCacheFactory, config, DS) {
    var DEFAULT_REQUEST_TIMEOUT = 5000; // 5s

    var baseURL = config.apiServer;
    var serviceArea = 'patients';
    var cache = $DSCacheFactory(serviceArea);
    var apiRequestTimeout = config.apiRequestTimeout || DEFAULT_REQUEST_TIMEOUT;
    cache.setOptions({
        maxAge: apiRequestTimeout,
        deleteOnExpire: 'aggressive'
    });
    if (config.cache === false) {
        cache.disable();
    }

    var service = {
        // Properties
        sortCriteria: [
            { key: 'lastname', 'name': 'core.LASTNAME' },
            { key: 'firstname', 'name': 'core.FIRSTNAME' },
            { key: 'birthdate', 'name': 'search.BIRTHDATE' }
        ],

        getPatients: getPatients,
        getPatientByCriteria: getPatientByCriteria,
        getPatientByPid: getPatientByPid,
        getPatientByVnb: getPatientByVnb,
        getPatientByLocation: getPatientByLocation,
        getPatientDetail: getPatientDetail,
        getPatientByUnit: getPatientByUnit,
        getPatientByService: getPatientByService,
        getPatientByRoomList: getPatientByRoomList,
        getPatientForPhysician: getPatientForPhysician,
        getPatientNextOfKinContactList: getPatientNextOfKinContactList,
        getPatientNextOfKinList: getPatientNextOfKinList,
        getPatientsCountByName: getPatientsCountByName,
        getPatientsByRooms: getPatientsByRooms,
        getPatientsCountByAdmissionDate: getPatientsCountByAdmissionDate,
        getPatientsCountByRooms: getPatientsCountByRooms
    };

    return service;

    /**
     * @ngdoc method
     * @name dataService.patients#getPatientByCriteria
     * @param  {Object} params Object holding the query arguments
     * @return {Promise}        Return a promise for a list of patients
     * @description
     *
     * Calls the function `getPatients()` with the following post data:
     *

        var postData = {
            companyid: params.companyid,
            limit: 10,
            sortorder: 'asc',
            orderby: 'lastname'
            offset: 0
        }

     * the company ID is a required argument.

     *
     */

    // ajout LM
    // function deserialize(data) {
    //     if (_.isArray(data)) {
    //         // Apply deserialization on all items in the array
    //         data.map(function(item) { return deserialize(item); });
    //     } else if (_.isObject(data)) {
    //         // Deserialize properties before data item is returned
    //         data.editedDate = new Date(data.editedDate + '00');
    //         data.referenceDate = new Date(data.referenceDate + '00');
    //     }

    //     return data;
    // }

    function getPatientByCriteria(params) {
        var postData = params;

        if (postData.birthdate !== null && postData.birthdate !== undefined) {
            postData.birthdate = moment(new Date(postData.birthdate)).format('YYYY-MM-DD');
        }
        if (postData.admissionstatus !== '' && postData.admissionstatus !== 'all') {
            postData.admissionstatus = postData.admissionstatus;
        }
        if (postData.sortorder !== 'asc' && postData.sortorder !== 'desc') {
            delete postData.sortorder;
        }

        return getPatients(postData, '', onMultiPatientSuccess);
    }

    /**
     * @ngdoc method
     * @name dataService.patients#getPatientByPid
     * @param  {int}    pid     Patient ID
     * @return {Promise}        Return a promis for a specific patient
     * @description
     *
     * Calls the function `getPatients()`
     * a given patient ID as post data.
     *
     */
    function getPatientByPid(pid) {
        return getPatients({
            pid: pid
        }, '', onSinglePatientSuccess);
    }

    /**
     * @ngdoc method
     * @name dataService.patients#getPatientByVnb
     * @param  {Object} params Object holding query arguments
     * @return {Promise}        Return a promise for a specific patient by a given visit number
     * @description
     *
     * Calls the function `getPatients()`
     * visit number as post data.
     *
     */
    function getPatientByVnb(query) {

        var params = query.toStateParams();

        var requiredField = ['vnb'];

        for (var i = 0; i < requiredField.length; i = i + 1) {
            if (params[requiredField[i]] === undefined || params[requiredField[i]] === null) {
                return $q(function(resolve, reject) {
                    reject(new Error('Missing argument ' + requiredField[i]));
                });
            }
        }

        return getPatients({
            //companyid: params.companyid,
            visitnb: params.vnb
        }, '', onSinglePatientSuccess);
    }

    /**
     * @ngdoc method
     * @name dataService.patients#getPatientByUnit
     * @param  {Object} params  Object holding query arguments
     * @return {Promis}         Return a promis for a list of patient by a given unit
     * @description
     *
     * Calls the function `getPatients()`
     * unit as post data. The company ID is also a required argument.
     *
     */
    function getPatientByUnit(params) {

        var requiredField = ['patientunit', 'companyid'];

        for (var i = 0; i < requiredField.length; i = i + 1) {
            if (params[requiredField[i]] === undefined || params[requiredField[i]] === null) {
                return $q(function(resolve, reject) {
                    reject(new Error('Missing argument ' + requiredField[i]));
                });
            }
        }

        var postData = angular.extend({
            offset: 0,
            limit: 9,
            orderby: 'patientroom',
            sortorder: 'desc',
            admissionstatus: 'currentadmission'
        }, params);

        return getPatients(postData, '', onMultiPatientSuccess);
    }
    /**
     * @ngdoc method
     * @name dataService.patients#getPatientByService
     * @param  {Object} params  Object holding query arguments
     * @return {Promis}         Return a promis for a list of patient by a given service
     * @description
     *
     * Calls the function `getPatients()`
     * unit as post data. The company ID is also a required argument.
     *
     */
    function getPatientByService(params) {

        var requiredField = ['hospservice', 'companyid'];

        for (var i = 0; i < requiredField.length; i = i + 1) {
            if (params[requiredField[i]] === undefined || params[requiredField[i]] === null) {
                return $q(function(resolve, reject) {
                    reject(new Error('Missing argument ' + requiredField[i]));
                });
            }
        }

        var postData = angular.extend({
            offset: 0,
            limit: 9,
            orderby: 'patientroom',
            sortorder: 'desc',
            admissionstatus: 'currentadmission'
        }, params);

        return getPatients(postData, '', onMultiPatientSuccess);
    }

    /**
     * @ngdoc method
     * @name dataService.patients#getPatientMyUnit
     * @param  {Object} params  Object holding query arguments
     * @return {Promis}         Return a promis for a list of patient by a given unit
     * @description
     *
     * Calls the function `getPatients()`
     * unit as post data. The company ID is also a required argument.
     *
     */
    function getPatientByRoomList(params) {

        var requiredField = ['companyid'];

        for (var i = 0; i < requiredField.length; i = i + 1) {
            if (params[requiredField[i]] === undefined || params[requiredField[i]] === null) {
                return $q(function(resolve, reject) {
                    reject(new Error('Missing argument ' + requiredField[i]));
                });
            }
        }

        var postData = angular.extend({
            offset: 0,
            limit: 9,
            orderby: 'patientroom',
            sortorder: 'desc',
            admissionstatus: 'currentadmission'
        }, params);

        return getPatients(postData, '', onMultiPatientSuccess);
    }

    /**
     * @ngdoc method
     * @name dataService.patients#getPatientForPhysician
     * @param  {Object} params Object holding query arguments
     * @return {Promis}        Returns a promis for a list of patients for a physician (staff-ID is determined server-side)
     * @description
     *
     * Calls the function `getPatients()`
     * following post data :
     *
        var postData = {
            offset: 0,
            orderby: 'admitdt',
            sortorder: 'desc',
            companyid: params.companyid
        }
     *
     * Company ID is an required argument.
     *
     */
    function getPatientForPhysician(params) {

        var requiredField = ['companyid'];

        for (var i = 0; i < requiredField.length; i = i + 1) {
            if (params[requiredField[i]] === undefined || params[requiredField[i]] === null) {
                return $q(function(resolve, reject) {
                    reject(new Error('Missing argument ' + requiredField[i]));
                });
            }
        }

        var postData = angular.extend({
            offset: params.offset || 0,
            orderby: params.orderby || 'admitdt',
            sortorder: params.sortorder || 'desc',
            byphysician: true
        }, params);

        return getPatients(postData, '', onMultiPatientSuccess);
    }

    /**
     * @ngdoc method
     * @name dataService.patients#getPatientByLocation
     * @param  {Object} params Object holding query arguments
     * @return {Promis}        Return a promis for a list of patient by a given location
     * @description
     *
     * Calls the function `getPatients()`
     * the following post data:

        var postData = {
            limit: 10,
            sortorder: 'asc',
            orderby: 'lastname',
            offset: '0'
        }
     *
     */
    function getPatientByLocation(params) {

        var requiredField = ['companyid'];

        for (var i = 0; i < requiredField.length; i = i + 1) {
            if (params[requiredField[i]] === undefined || params[requiredField[i]] === null) {
                return $q(function(resolve, reject) {
                    reject(new Error('Missing argument ' + requiredField[i]));
                });
            }
        }

        var postData = params;

        if (postData.admissionstatus === 'all') {
            delete postData.admissionstatus;
        }
        if (postData.admissionstatus === undefined && postData.admitdt !== null && postData.admitdt !==
            undefined) {
            postData.admitdt = moment(new Date(postData.admitdt)).format('YYYY-MM-DD');
        }
        if (postData.sortorder !== 'asc' && postData.sortorder !== 'desc') {
            delete postData.sortorder;
        }

        return getPatients(postData, '', onMultiPatientSuccess);
    }

    /**
     * @ngdoc method
     * @name dataService.patients#getPatientDetail
     * @param  {Number} pid Patient ID
     * @return {Promis}     Return a promis for details of a patient
     * @description
     *
     * Calls the function `getPatients()` with a given patient ID.
     */
    function getPatientDetail(pid) {

        return getPatients({}, pid, onPatientDetailSuccess);
    }

    /**
     * @ngdoc method
     * @name dataService.patients#getPatientNextOfKinContactList
     * @param {Number} pid patientId
     * @param {Number} nokid nextOfKinId
     * @return {Promise}   Return a promise
     * @description
     *
     * Return a list of contacts.

        dataService
            .getPatientNextOfKinContactList(nextOfKinId)
            .then(function (contacts) {
                // List of contacts
            })
            .catch(function(exception) {
                // Behave like an error occured
            });

     * `contacts` variable is actually process by getNextOfKinContactList and return
     * a clean list of contacts in a private function called `onMultiContactSuccess()`.

     *
     */
    function getPatientNextOfKinContactList(nokid) {
        return getPatients({}, 'noks/' + nokid + '/contacts', onMultiPatientNextOfKinContactSuccess);
    }

    /**
     * @ngdoc service
     * @module app.core
     * @name dataService.patients#getPatientNextOfKinList
     * @requires configProvider
     * @description
     *
     * This factory send query on nextofkin services.<br/>
     * Server address is define in {@link configProvider#config configProvider.config.apiServer}.<br/>
     * Data are cached 5000ms (5s)
     *
        angular
            .module('myModule')
            .controller('myController', ctrlFunction);

        ctrlFunction.$inject = ['dataservice.patients'];

        function ctrlFunction(dataService) {
            dataService.getPatientNextOfKinList(pid).then(...);
        }

     *
     */
    function getPatientNextOfKinList(pid) {
        return getPatients({}, pid + '/noks', onMultiPatientNextOfKinSuccess);
    }

    /**
     * Get the counts of patients by patient last name
     * eg: [
     *   {count: 5, lastName: "A"},
     *   {count: 18, lastName: "C"},
     *   {count: 7, lastName: "D"},
     *   {count: 3, lastName: "G"}
     * ]
     * @param params
     * @returns {*}
     */
    function getPatientsCountByName(params) {
        var requiredField = ['companyid'];

        for (var i = 0; i < requiredField.length; i = i + 1) {
            if (params[requiredField[i]] === undefined || params[requiredField[i]] === null) {
                return $q(function(resolve, reject) {
                    reject(new Error('Missing argument ' + requiredField[i]));
                });
            }
        }

        var postData = angular.extend({
            admissionstatus: 'currentadmission',
            orderby: 'lastname',
            sortorder: params.sortorder ? params.sortorder : 'asc'
        }, params);

        return getPatients(postData, 'countbyname', function(data) { return data; });
    }

    /**
     * Get patients count index by admission date
     */
    function getPatientsCountByAdmissionDate(params) {
        var requiredField = ['companyid'];

        for (var i = 0; i < requiredField.length; i = i + 1) {
            if (params[requiredField[i]] === undefined || params[requiredField[i]] === null) {
                return $q(function(resolve, reject) {
                    reject(new Error('Missing argument ' + requiredField[i]));
                });
            }
        }

        var postData = angular.extend({
            admissionstatus: 'currentadmission',
            orderby: 'admitdt',
            sortorder: params.sortorder ? params.sortorder : 'asc'
        }, params);

        return getPatients(postData, params['companyid'] + '/countbyadmitdate', function(data) {
            // TODO: MW to handle sorting order (asc, desc) + pagination (origin, limit)

            // data: [{count: 7, admitdt: '2016-05-13'}]
            _.each(data, function(item) {
                item.date = moment(new Date(item.admitdt)).format('YYYY-MM-DD');
            });

            return data;
        });
    }


    /**
     * Get list of patients grouped by rooms.
     * @param params
     * @returns {*}
     *
     * - Collapsed view: The returned room list is limited by total number of patients passed ('limit'), and each list of patients by room
     * is limited by a number of patients passed ('maxpatientsbyroom').
     *
     * Eg:
     * Given,
     *
     *   limit = 5 => total number of patients returned in the list,
     *   maxpatientsbyroom = 3 => max number of patients per room
     *
     * eg 1:
     *       [
     *         {patientRoom: "101", nbPatients: 2, ...},
     *         {patientRoom: "102", nbPatients: 1, ...},
     *         {patientRoom: "103", nbPatients: 2, ...}
     *       ]
     *
     *       limit = 2 + 1 + 2 = 5
     *
     * eg 2:
     *       [
     *         {patientRoom: "201", nbPatients: 2, ...},
     *         {patientRoom: "202", nbPatients: 3, ...}
     *       ]
     *
     *       limit = 2 + 3 = 5
     *
     * eg 3:
     *       [
     *         {patientRoom: "301", nbPatients: 1, ...},
     *         {patientRoom: "302", nbPatients: 2, ...},
     *         {patientRoom: "303", nbPatients: 1, ...},
     *         {patientRoom: "304", nbPatients: 1, ...}
     *       ]
     *
     *       limit = 1 + 2 + 1 + 1 = 5
     *
     * - Expanded view: The returned room list has patient details ('patientdetails' = true) and is paginated; is limited by the total number of patients ('limit') and starting at a given patient ('offset')
     *
     * eg:
     *
     *      [
     *        { patientRoom: "101",
     *          nbPatients: 2,
     *          patients: [ { patientInfo: {}, lastVisit: {} }, { patientInfo: {}, lastVisit: {} } ]
     *        },
     *        { patientRoom: "102",
     *          nbPatients: 1,
     *          patients: [ { patientInfo: {}, lastVisit: {} } ]
     *        }
     *      ]
     *
     */
    function getPatientsByRooms(params) {
        var requiredField = ['companyid'];

        for (var i = 0; i < requiredField.length; i = i + 1) {
            if (params[requiredField[i]] === undefined || params[requiredField[i]] === null) {
                return $q(function(resolve, reject) {
                    reject(new Error('Missing argument ' + requiredField[i]));
                });
            }
        }

        var postData = angular.extend({
            sortorder: params.sortorder ? params.sortorder : 'asc'
        }, params);

        var endpoint = ENDPOINT_NAME + '/byrooms';

        return DS
            .findAll(RESOURCE_NAME, postData, {
                endpoint: endpoint,
                bypassCache: true,
                cacheResponse: false
            });
    }

    /**
     * Get the counts of patients by patient room
     * eg: [
     *   {nbPatients: 5, patientRoom: "0"},
     *   {nbPatients: 18, patientRoom: "101"},
     *   {nbPatients: 7, patientRoom: "102"},
     *   {nbPatients: 3, patientRoom: "103"}
     * ]
     * @param params
     * @returns {*}
     */
    function getPatientsCountByRooms(params) {
        var requiredField = ['companyid'];

        for (var i = 0; i < requiredField.length; i = i + 1) {
            if (params[requiredField[i]] === undefined || params[requiredField[i]] === null) {
                return $q(function(resolve, reject) {
                    reject(new Error('Missing argument ' + requiredField[i]));
                });
            }
        }

        var postData = angular.extend({
            admissionstatus: 'currentadmission',
            orderby: 'patientroom',
            sortorder: params.sortorder ? params.sortorder : 'asc'
        }, params);


        var endpoint = ENDPOINT_NAME + '/byrooms/count';

        return DS
            .findAll(RESOURCE_NAME, postData, {
                endpoint: endpoint,
                bypassCache: true,
                cacheResponse: false
            });
    }

    /**
     * private method
     * @name dataService.patients#getPatient
     * @param  {Object} params          Object holding all query arguments
     * @param  {String} serviceSubArea  REST URL
     * @param  {function()} successInternal Internal success function
     * @return {Promis}                 Return a promise for a list of patients
     */
    function getPatients(params, serviceSubArea, successInternal) {
        /*var cacheKey = serviceArea + serviceSubArea + paramsToKeyString(params);

        if (config.cache && cache.get(cacheKey) !== undefined) {
            return $q(function(resolve, reject) {
                try {
                    var result = successInternal(cache.get(cacheKey));
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            });
        } else {*/
        var deferred = $q.defer();
        var url = baseURL + '/' + serviceArea;
        url = serviceSubArea ? url + '/' + serviceSubArea : url;
        $http({
            method: 'get',
            url: url,
            params: params,
            timeout: apiRequestTimeout
        }).then(function(response) {
            try {
                var result = successInternal(response.data);
                //cache.put(cacheKey, data);
                deferred.resolve(result);
            } catch (error) {
                error.response = response.data;
                deferred.reject(error);
            }
        }).catch(function(error) {
            deferred.reject(error);
        });

        return deferred.promise;
    }
    //}

    /**
     * private method
     */
    function paramsToKeyString(obj) {
        var str = '';
        for (var p in obj) {
            if (obj.hasOwnProperty(p)) {
                str += p + '/' + obj[p] + '/';
            }
        }
        return str;
    }

    /**
     * private method
     */
    function onSinglePatientSuccess(data) {
        var patient = null;
        var visit = null;

        if (!_.isEmpty(data)) {
            var row = data[0];
            row.patientInfo.sex = remapGender(row.patientInfo.sex);

            patient = row.patientInfo;
            patient.firstName = normalizeName(row.patientInfo.firstName);
            patient.lastName = normalizeName(row.patientInfo.lastName);
            patient.maidenName = normalizeName(row.patientInfo.maidenName);
            visit = row.lastVisit;
        }

        return {
            patient: patient,
            visit: visit
        };
    }

    /**
     * Private function
     */
    function onMultiPatientNextOfKinContactSuccess(data) {
        var contactsList = [];
        if (data !== null && data !== undefined) {
            var contact = data;
            if (!Array.isArray(contact)) {
                contactsList = [contact];
            } else {
                contactsList = contact;
            }
        }

        return contactsList;
    }

    /**
     * Private function
     */
    function onMultiPatientNextOfKinSuccess(data) {
        var nextofkins = [];

        if (data !== null && data !== '') {
            nextofkins = data;
        }

        if (!Array.isArray(nextofkins)) {
            nextofkins = [nextofkins];
        }

        return nextofkins;
    }

    /**
     * private method
     */
    function onMultiPatientSuccess(data) {
        var patients = [];
        var totalRecords = 0;

        if (!_.isEmpty(data)) {
            var p = data;
            if (!Array.isArray(p)) {
                p = [p];
            }

            for (var i = 0; i < p.length; i = i + 1) {

                p[i].patientInfo.sex = remapGender(p[i].patientInfo.sex);
                p[i].patientInfo.firstName = normalizeName(p[i].patientInfo.firstName);
                p[i].patientInfo.lastName = normalizeName(p[i].patientInfo.lastName);
                p[i].patientInfo.maidenName = normalizeName(p[i].patientInfo.maidenName);

                if (p[i].patientInfo.birthDate && p[i].patientInfo.birthDate.indexOf('+') > -1) {
                    p[i].patientInfo.birthDate = p[i].patientInfo.birthDate.split('+')[0];
                }
                patients.push({
                    patient: p[i].patientInfo,
                    visit: p[i].lastVisit
                });
                totalRecords = p[i]['nbRecords'];
            }
        }

        return {
            patients: patients,
            'nb_records': totalRecords
        };
    }

    /**
     * private method
     **/
    function remapGender(inGender) {
        const GENDER_FEMALE = 'f',
            GENDER_FEMALE_W = 'w',
            GENDER_MALE = 'm',
            GENDER_UNKNOWN = 'u';

        if (inGender) {
            inGender = inGender.toLowerCase();
            // female
            if(inGender.indexOf(GENDER_FEMALE_W) === 0 || inGender.indexOf(GENDER_FEMALE) === 0) {
                return GENDER_FEMALE;
            }
            // male
            else if(inGender.indexOf(GENDER_MALE) === 0) {
                return GENDER_MALE;
            }
            // unknown gender
            else {
                return GENDER_UNKNOWN;
            }
        }

        return null;
    }

    /**
     * private method
     **/
    function normalizeName(name) {
        if (name !== null) {
            return name.replace(/([^\W_]+[^\s-]*) */g, function(txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
        } else {
            return null;
        }
    }

    /**
     * private method
     */
    function onPatientDetailSuccess(data) {
        var patient = null;
        if (data !== null && data !== '') {
            patient = data;

            if (!patient.contacts) {
                patient.contacts = [];
            }
            patient.patientInfo.sex = remapGender(patient.patientInfo.sex);
            patient.patientInfo.firstName = normalizeName(patient.patientInfo.firstName);
            patient.patientInfo.lastName = normalizeName(patient.patientInfo.lastName);
            patient.patientInfo.maidenName = normalizeName(patient.patientInfo.maidenName);

        }
        return patient;
    }
}

export {
    dataServicePatients,
    run
}
