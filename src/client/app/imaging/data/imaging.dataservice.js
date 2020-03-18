/*jshint -W101*/ //  Line too long

const IMAGING_RESOURCE_NAME = 'imaging';
const IMAGING_ENTITY_KEY = 'serieUid';
const IMAGING_ENDPOINT_NAME = 'radiology';

const REPORTS_RESOURCE_NAME = 'reports';
const REPORTS_ENTITY_KEY = 'studyUid';
const REPORTS_ENDPOINT_NAME = 'radiology/reports';


const run = ['config', 'DS', function (config, DS) {

    // Define imaging resource
    DS.defineResource({
        name: IMAGING_RESOURCE_NAME,
        endpoint: IMAGING_ENDPOINT_NAME,
        idAttribute: IMAGING_ENTITY_KEY,
        basePath: config.apiServer,
        relations: {
            belongsTo: {
                patient: {
                    localField: 'patient',
                    localKey: 'pid',
                    parent: true
                }
            }
        }
    });

    // Define reports resource
    DS.defineResource({
        name: REPORTS_RESOURCE_NAME,
        endpoint: REPORTS_ENDPOINT_NAME,
        idAttribute: REPORTS_ENTITY_KEY,
        basePath: config.apiServer
    });
}];

dataServiceImaging.$inject = ['$http', 'DS', 'helpers', 'config', 'sessionService'];

/**
* @ngdoc service
* @module app.imaging
* @name dataService.imaging
* @requires configProvider
* @description
* This factory returns data from imaging<br/>
* Server address is define in {@link configProvider#config configProvider.config.apiServer}.<br/>
*
 angular
     .module('myModule')
     .controller('myController', ctrlFunction);

 ctrlFunction.$inject = ['dataservice.imaging'];

 function ctrlFunction(imagingservice) {
     imagingservice.getExams(params).then(...);
 }

*/
function dataServiceImaging($http, DS, helpers, config, sessionService) {

    // Wire-up data services
    var resourceImaging = DS.definitions[IMAGING_RESOURCE_NAME];
    resourceImaging.afterFind = function (Resource, data, cb) { return _deserializeImaging(data); };
    resourceImaging.afterFindAll = function (Resource, data) { return _deserializeImaging(data); };

    // Wire-up data services
    var resourceReports = DS.definitions[REPORTS_RESOURCE_NAME];
    resourceReports.afterFind = function (Resource, data, cb) { return _deserializeReports(data); };
    resourceReports.afterFindAll = function (Resource, data) { return _deserializeReports(data); };

    var service = {
        // Properties
        sortCriteria: [
            { key: 'examdt', name: 'imaging.EXAM_DATE' }
        ],

        // Methods
        getExams: getExams,
        getReports: getReports,
        hasImagingData: hasImagingData,
        hasReportData: hasReportData,
        //sendReportByEmail: sendReportByEmail
    };

    return service;

    /**
    * @ngdoc method
    * @name dataService.imaging#getExams
    * @param  {Number}  patientId     Patient ID
    * @return {Promise}         Return a promise
    * @description
    *
    * Return a list of imaging exams for one patient.

    imagingService
        .getExams(pid)
        .then(function (result) {
             // List of exams and number of totalRecords
        })
        .catch(function(exception) {
             // Behave like an error occured
             // Never occured since we always just return a static array
        });

    */
    function getExams(patientId) {
        return DS
            .findAll(IMAGING_RESOURCE_NAME, {
                pid: patientId
            });
    }

    function getReports(patientId) {
        return DS
            .findAll(REPORTS_RESOURCE_NAME, {
                pid: patientId
            });
    }

    function hasImagingData(patientId) {
        return DS
            .findAll(IMAGING_RESOURCE_NAME, {
                pid: patientId,
                limit: 1
            }, {
                endpoint: IMAGING_ENDPOINT_NAME + '/count',
                bypassCache: true,
                cacheResponse: false
            })
            .then(function (data) {
                return _.isObject(data) && _.isNumber(data.count) && data.count > 0;
            });
    }

    function hasReportData(patientId) {
        return DS
            .findAll(REPORTS_RESOURCE_NAME, {
                pid: patientId,
                limit: 1
            }, {
                endpoint: REPORTS_ENDPOINT_NAME + '/count',
                bypassCache: true,
                cacheResponse: false
            })
            .then(function (data) {
                return _.isObject(data) && _.isNumber(data.count) && data.count > 0;
            });
    }

    /*function sendReportByEmail(uniqueStudyId, patientId, emailAddress) {

        var language = sessionService.user.preferredLanguage;

        return $http({
            method: 'GET',
            url: config.apiReportEmail,
            params: {
                uid: uniqueStudyId,
                pid: patientId,
                email: emailAddress,
                lang: language
            }
        });
    }*/

    // -------------------------------------------------------- Serialization / Deserialization

    function _deserializeImaging(data) {
        if (_.isArray(data)) {
            // Apply deserialization on all items in the array
            data.map(function (item) { return _deserializeImaging(item); });
        } else if (_.isObject(data)) {
            // Deserialize properties before data item is returned
            helpers.toDate(data, 'serieObsDate');
        }

        return data;
    }

    function _deserializeReports(data) {
        if (_.isArray(data)) {
            // Apply deserialization on all items in the array
            data.map(function (item) { return _deserializeReports(item); });
            return _groupReports(data);
        } else if (_.isObject(data)) {
            // Deserialize properties before data item is returned
            helpers.toDate(data, 'studyDate');
            return data;
        }
    }

    // --------------------------------------------------------

    function _groupReports(reports) {
        // group reports by orderNb
        var reportsByOrderNumber = _.groupBy(reports, 'orderNb');

        // order reports by 'rank'
        var orderedReports = [];
        if(!_.isEmpty(reports) && reports[0].hasOwnProperty('rank')) {
            _.forEach(reportsByOrderNumber, function (report) {
                var ordered = _.orderBy(report, 'rank');
                orderedReports.unshift(ordered);
            });
        }
        else {
            orderedReports = reportsByOrderNumber;
        }

        // build report history
        var groupedReports = [];
        _.forEach(orderedReports, function(reports) {
            reports[0].history = [];
            for(var i=1; i<reports.length; i++) {
                reports[0].history.push(reports[i]);
            }
            groupedReports.unshift(reports[0]);
        });

        return groupedReports;
    }
}

export {
    dataServiceImaging,
    run
}
