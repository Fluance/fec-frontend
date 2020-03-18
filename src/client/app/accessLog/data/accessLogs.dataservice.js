/*jshint -W101*/ //  Line too long

const RESOURCE_NAME = 'logs/patient';
const ENDPOINT_NAME = RESOURCE_NAME;
const ENTITY_KEY = 'pid';


const run = ['config', 'DS', function(config, DS) {
    DS.defineResource({
        name: RESOURCE_NAME,
        endpoint: ENDPOINT_NAME,
        basePath: config.apiServer,
        idAttribute: ENTITY_KEY
    });
}];

dataServiceAccessLogs.$inject = ['DS'];

/**
 * @ngdoc service
 * @module app.accessLog
 * @name dataservice.accessLogs
 */
function dataServiceAccessLogs(DS) {
    var service = {
        // Contstants
        OBJECT_TYPE_REPORTING: 'Reporting',

        // Properties
        sortCriteria: [
            { key: 'lastName', name: 'accessLog.LAST_NAME' },
            { key: 'logDate', name: 'accessLog.LOG_DATE' }
        ],

        // Methods
        getAccessLogs: getAccessLogs,
        getAccessLogsDetails: getAccessLogsDetails,
        getAccessLogsDetailsWithUrl: getAccessLogsDetailsWithUrl,
        hasAccessLogData: hasAccessLogData,
        getAccessLogsCount: getAccessLogsCount,
        getAccessLogsDetailsCount: getAccessLogsDetailsCount,
        getAccessLogsDetailsWithUrlCount: getAccessLogsDetailsWithUrlCount,
        writeLog: writeLog
    };

    return service;

    // --------------------------------------------------------------- Interface implementation

    /**
     * @ngdoc method
     * @name dataservice.accessLogs#getAccessLogs
     * @param  {Object}   params
     * @param  {String}   params.pid            The patient ID to get the access log entries for
     * @param  {Number=}  params.offset         The number of records to skip
     * @param  {Number=}  params.limit          The size of the page to return
     * @param  {String=}  params.orderBy        The sorting type
     * @param  {String=}  params.sortOrder      The sort direction
     * @return {Promise}                        Returns a pomise with the list of access log entries
     * @description
     *
     * Returns a list of access log entries for the specified patient.
     */
    function getAccessLogs(params) {
        var endpoint = ENDPOINT_NAME + '/' + params.pid;

        return DS
            .findAll(RESOURCE_NAME, {
                offset: params.offset,
                limit: params.limit,
                orderby: params.orderby,
                sortorder: params.sortorder
            }, {
                endpoint: endpoint,
                bypassCache: true,
                cacheResponse: false
            })
            .then(function(data) {
                return data;
            });
    }
    /**
     * @ngdoc method
     * @name dataservice.accessLogs#getAccessLogs
     * @param  {Object}   params
     * @param  {String}   params.pid            The patient ID to get the access log entries for
     * @param  {String}   params.domain         The patient domain to get the access log entries detail
     * @param  {String}   params.userName       The patient user name to get the access log entries detail
     * @param  {Number=}  params.offset         The number of records to skip
     * @param  {Number=}  params.limit          The size of the page to return
     * @param  {String=}  params.orderBy        The sorting type
     * @param  {String=}  params.sortOrder      The sort direction
     * @return {Promise}                        Returns a pomise with the list of access log entries
     * @description
     *
     * Returns a list of access log entries for the specified patient.
     */
    function getAccessLogsDetails(params) {
        var endpoint = ENDPOINT_NAME + '/' + params.pid + '/users/' + params.domain + '/' + params.userName;

        return DS
            .findAll(RESOURCE_NAME, {
                offset: params.offset,
                limit: params.limit,
                orderby: params.orderby,
                sortorder: params.sortorder
            }, {
                endpoint: endpoint,
                bypassCache: true,
                cacheResponse: false
            })
            .then(function(data) {
                return data;
            });
    }

    /**
     * @ngdoc method
     * @name dataservice.accessLogs#getAccessLogsDetailsWithUrl
     * @param  {Object}   params
     * @param  {String}   params.pid            The patient ID to get the access log entries for
     * @param  {String}   params.detailUrl      The end of the url to get the details
     * @param  {Number=}  params.offset         The number of records to skip
     * @param  {Number=}  params.limit          The size of the page to return
     * @param  {String=}  params.orderBy        The sorting type
     * @param  {String=}  params.sortOrder      The sort direction
     * @return {Promise}                        Returns a pomise with the list of access log entries
     * @description
     *
     * Returns a list of access log entries for the specified patient.
     */
    function getAccessLogsDetailsWithUrl(params) {
        var endpoint = ENDPOINT_NAME + '/' + params.pid + params.detailUrl;

        return DS
            .findAll(RESOURCE_NAME, {
                offset: params.offset,
                limit: params.limit,
                orderby: params.orderby,
                sortorder: params.sortorder
            }, {
                endpoint: endpoint,
                bypassCache: true,
                cacheResponse: false
            })
            .then(function(data) {
                return data;
            });
    }



    /**
     * @ngdoc method
     * @name dataservice.accessLogs#getAccessLogsCount
     * @param  {String}   patientId             The patient ID to count the access log entries
     * @return {Promise}                        Returns a pomise with the count of access log entries
     * @description
     *
     * Returns the number of access log entries found for the specified patient.
     */
    function getAccessLogsCount(patientId) {
        var endpoint = ENDPOINT_NAME + '/' + patientId + '/count';

        return DS
            .findAll(RESOURCE_NAME, {}, {
                endpoint: endpoint,
                cacheResponse: false
            })
            .then(function(data) {
                return data.count;
            });
    }
    /**
     * @ngdoc method
     * @name dataservice.accessLogs#getAccessLogsDetailsCount
     * @param  {String}   patientId             The patient ID to count the access log entries detail
     * @param  {String}   domain                The patient domain to count the access log entries detail
     * @param  {String}   userName              The patient user name to count the access log entries detail
     * @return {Promise}                        Returns a pomise with the count of access log entries details
     * @description
     *
     * Returns the number of access log details entries found for the specified patient.
     */
    function getAccessLogsDetailsCount(patientId, domain, username) {
        var endpoint = ENDPOINT_NAME + '/' + patientId + '/users/' + domain + '/' + username + '/count';
        // var endpoint = ENDPOINT_NAME + '/1040000 /users/PRIMARY/admin/count';

        return DS
            .findAll(RESOURCE_NAME, {}, {
                endpoint: endpoint,
                cacheResponse: false
            })
            .then(function (data) {
                return data.count;
            });
    }

    /**
     * @ngdoc method
     * @name dataservice.accessLogs#getAccessLogsDetailsWithUrlCount
     * @param  {String}   patientId             The patient ID to count the access log entries detail
     * @param  {String}   detailUrl             The end of the url to get the details, /count will be concatenated
     * @return {Promise}                        Returns a pomise with the count of access log entries details
     * @description
     *
     * Returns the number of access log details entries found for the specified patient.
     */
    function getAccessLogsDetailsWithUrlCount(patientId, detailUrl) {
        var endpoint = ENDPOINT_NAME + '/' + patientId + detailUrl + '/count';
        // var endpoint = ENDPOINT_NAME + '/1040000 /users/PRIMARY/admin/count';

        return DS
            .findAll(RESOURCE_NAME, {}, {
                endpoint: endpoint,
                cacheResponse: false
            })
            .then(function (data) {
                return data.count;
            });
    }


    /**
     * @ngdoc method
     * @name dataservice.accessLogs#hasAccessLogData
     * @param  {String}   patientId             The patient ID to count the access log entries
     * @return {Promise}                        Returns a pomise with value indicating whether there are access log entries
     * @description
     *
     * Gets the value whether there are access log entries for the specified patient.
     */
    function hasAccessLogData(patientId) {
        return getAccessLogsCount(patientId)
            .then(function(count) {
                return count > 0;
            });
    }

    /**
     * @ngdoc method
     * @name dataservice.accessLogs#writeLog
     * @param  {String}   patientId             The patient to count the access log entries
     * @param  {String}   objectType            The type of object that has been visited by the user
     * @param  {String}   visitNbr              The visit number of the resource the user just visited
     * @return {Promise}                        Returns a void pomise
     * @description
     *
     * Writes a new access log entry.
     */
    function writeLog(patientId, objectType, visitNbr) {
        var endpoint = RESOURCE_NAME;

        // Define query parameters
        var query = [];
        if (objectType) { query.push('objectType=' + objectType); }
        if (patientId) { query.push('pid=' + patientId); }
        if (visitNbr) { query.push('vnb=' + visitNbr); }
        if (query.length > 0) { endpoint += '?' + query.join('&'); }

        return DS.create(RESOURCE_NAME, {}, {
            endpoint: endpoint,
            method: 'POST',
            cacheResponse: false
        });
    }
}

export {
    dataServiceAccessLogs,
    run
}
