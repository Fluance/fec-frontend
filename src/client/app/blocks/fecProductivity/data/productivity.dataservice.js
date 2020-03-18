const PATIENT_VCARD_API = '/patients/vcard/';
const PHYSICIAN_VCARD_API = '/physician/vcard/';
const ICALENDAR_API = '/ical?';

dataServiceProductivity.$inject = ['config'];

/**
 * @ngdoc service
 * @module productivity
 * @name dataService.productivity
 */
function dataServiceProductivity(config) {
    var service = {
        // Methods
        getPatientVCardUrl: getPatientVCardUrl,
        getPhysicianVCardUrl: getPhysicianVCardUrl,
        getCalendarEventUrl: getCalendarEventUrl
    };

    return service;

    function getPatientVCardUrl(patientId) {
        return config.apiServer + PATIENT_VCARD_API + patientId;
    }

    function getPhysicianVCardUrl(physicianId) {
        return config.apiServer + PHYSICIAN_VCARD_API + physicianId;
    }

    function getCalendarEventUrl(eventName, eventStart, eventEnd, url, location, patient, responsible) {
        var queryData = {};

        if (!_.isUndefined(eventName)) {
            queryData.eventName = eventName;
        }

        if (!_.isUndefined(eventStart)) {
            queryData.eventStart = eventStart;
        }

        if (!_.isUndefined(eventEnd)) {
            queryData.eventEnd = eventEnd;
        }

        if (!_.isUndefined(url)) {
            queryData.url = url;
        }

        if (!_.isUndefined(location)) {
            queryData.location = location;
        }

        if (!_.isUndefined(patient)) {
            queryData.patient = patient;
        }

        if (!_.isUndefined(responsible)) {
            queryData.responsible = responsible;
        }

        var queryString = encodeQueryData(queryData);
        return config.apiServer + ICALENDAR_API + queryString;
    }

    // ------------------------------------------- Helper Methods

    /**
     * Return query string with encoded parameters
     */
    /*
    private encodeQueryData(data: any): string {
      let query = [];
      for (let d in data) {
        query.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
      }
      return query.join('&');
    }
    */

    function encodeQueryData(data) {
        return Object.keys(data).map(function (key) {
            return [key, data[key]].map(encodeURIComponent).join('=');
        }).join('&');
    }
}

export default dataServiceProductivity;
