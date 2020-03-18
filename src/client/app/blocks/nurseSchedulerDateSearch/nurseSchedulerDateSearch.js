/**
 * @ngdoc filter
 * @name nurseSchedulerDateSearch
 * @function
 * @param {Array} input array with all appointments
 * @param {String} search text
 * @returns {Array} Appointments
 *
 * @description
 * A filter that Filter all appointments for the searched text
 *
    {{ 'Array of all appointments' | nurseSchedulerDateSearch : search}}
* Result: list of appointments searching by saearch input
 */


nurseSchedulerDateSearch.$inject = ['$filter'];

/* @ngInject */
function nurseSchedulerDateSearch($filter) {
    return _.memoize(
        function(input, searchText) {
            var returnValue = [];
            var temporaryDatas = {};
            var temporaryData = {};
            var searchTextArray = [];

            // Split the searchtext into words for the search
            if (searchText && searchText.indexOf(',') > -1) {
                searchTextArray = searchText.split(',');
                searchTextArray = _.map(searchTextArray, function(searchTextEntry) {
                    return searchTextEntry.trim();
                });
            } else if (searchText) {
                searchTextArray.push(searchText.trim());
            }

            // Go trough all appointments and filter them by the searched string
            if (searchTextArray.length >= 1) {
                searchTextArray.forEach(function (searchTextString) {
                    input.forEach(function(datas) {
                        temporaryDatas = jQuery.extend(true, {  }, datas);
                        temporaryDatas.data = [];
                        datas.data.forEach(function(data) {
                            temporaryData = jQuery.extend(true, {}, data);
                            temporaryData.data = [];
                            if (checkText(data.date, searchTextString)) {
                                temporaryData.data = data.data;
                            } else {
                                data.data.forEach(function(appointment) {
                                    if (checkArray([appointment.appointment_type, appointment.description, appointment.begindt, $filter('formatDate')(appointment.begindt, 'month'), appointment.enddt, appointment.financialclass, appointment.location_name, appointment.location_type, appointment.physician, appointment.visit_nb, appointment.patient.firstName, appointment.patient.lastName, appointment.patient.id, appointment.patient.maidenName], searchTextString)){
                                        temporaryData.data.push(appointment);
                                    }
                                });
                            }
                            checkAndAddToArray(temporaryData.data, temporaryData, temporaryDatas.data);
                        });
                        checkAndAddToArray(temporaryDatas.data, temporaryDatas, returnValue);
                    });
                    input = returnValue;
                    returnValue = [];
                });
            }
            return input;
        },
        function resolver(collection, field) {
            return collection.length + field;}

    );

    /**
     * Private function
     */
    function checkAndAddToArray(checkLength, data, array) {
        if (checkLength.length >= 1) {
            array.push(data);
        }
    }

    /**
     * Private function
     */
    function checkText(originalText, comparingText) {
        if (comparingText) {
            if (originalText) {
                var oT = originalText + '';
                var cT = comparingText + '';

                oT = oT.toLowerCase();
                cT = cT.toLowerCase();

                return oT.indexOf(cT) > -1;
            }
            return false;
        }
        return true;
    }

    /**
     * Private function
     */
    function checkArray(array, comparingText) {
        var returnValue = false;
        array.forEach(function(originalText) {
            if (checkText(originalText, comparingText)) {
                returnValue = true;
                return returnValue;
            }
        });
        return returnValue;
    }
}


export default nurseSchedulerDateSearch;
