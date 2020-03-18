/**
 * @ngdoc filter
 * @name nurseSchedulerPatientSearch
 * @function
 * @param {Array} input array with all appointments
 * @param {String} search text
 * @returns {Array} Appointments
 *
 * @description
 *
 *
 * Filter all appointments for the searched text

 {{ 'Array of all appointments' | nurseSchedulerPatientSearch : search}}
 * Result: list of appointments by search input
 */

nurseSchedulerPatientSearch.$inject = ['$filter'];

/* @ngInject */
function nurseSchedulerPatientSearch($filter) {
    return _.memoize(
        function(input, searchText) {
            var returnValue = [];
            var temporaryRoom = {};
            var temporaryPatient = {};
            var temporaryAppointment = {};
            var temporaryDatas = {};

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
                searchTextArray.forEach(function(searchTextString) {
                    input.forEach(function(room) {
                        temporaryRoom = jQuery.extend(true, {}, room);
                        temporaryRoom.patients = [];
                        if (checkText(('Room ' + room.room), searchTextString)) {
                            temporaryRoom.patients = room.patients;
                        } else {
                            room.patients.forEach(function(patient) {
                                temporaryPatient = jQuery.extend(true, {}, patient);
                                if (checkArray([patient.firstName, patient.lastName, patient.id, patient.maidenName], searchTextString)) {
                                    temporaryPatient.appointments = patient.appointments;
                                } else {
                                    temporaryPatient.appointments = [];
                                    patient.appointments.forEach(function(appointment) {
                                        temporaryAppointment = jQuery.extend(true, {}, appointment);
                                        temporaryAppointment.data = [];
                                        appointment.data.forEach(function(datas) {
                                            temporaryDatas = jQuery.extend(true, {}, datas);
                                            if (checkArray([datas.date], searchTextString)) {
                                                temporaryDatas.data = datas.data;
                                            } else {
                                                temporaryDatas.data = [];
                                                datas.data.forEach(function(data) {
                                                    if (checkArray([data.appointment_type, data.description, data.begindt, $filter('formatDate')(data.begindt, 'month'), data.enddt, data.financialclass, data.location_name, data.location_type, data.physician, data.visit_nb], searchTextString)) {
                                                        temporaryDatas.data.push(data);
                                                    }
                                                });
                                            }
                                            checkAndAddToArray(temporaryDatas.data, temporaryDatas, temporaryAppointment.data)
                                        });
                                        checkAndAddToArray(temporaryAppointment.data, temporaryAppointment, temporaryPatient.appointments)
                                    });
                                }
                                checkAndAddToArray(temporaryPatient.appointments, temporaryPatient, temporaryRoom.patients)
                            });
                        }
                        checkAndAddToArray(temporaryRoom.patients, temporaryRoom, returnValue);
                    });
                    input = returnValue;
                    returnValue = [];
                });
            }
            return input;
        },
        function resolver(collection, field) {
            return collection.length + field;
        }
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


export default nurseSchedulerPatientSearch;
