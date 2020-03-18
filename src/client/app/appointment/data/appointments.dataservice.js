const RESOURCE_NAME_LOCATION_APPOINTMENTS = 'appointments';
const ENDPOINT_NAME_LOCATION_APPOINTMENTS = '/appointments';

const RESOURCE_NAME_USER_APPOINTMENTS = 'userappointments';
const ENDPOINT_NAME_USER_APPOINTMENTS = '/appointments/mypatients';
const RESOURCE_NAME_OPERATION_NOTE = 'operationnote';
const ENDPOINT_NAME_OPERATION_NOTE = 'appointments';

const run = ['config', 'DS', '$filter', function (config, DS, $filter) {
    DS.defineResource({
        name: RESOURCE_NAME_LOCATION_APPOINTMENTS,
        endpoint: ENDPOINT_NAME_LOCATION_APPOINTMENTS,
        basePath: config.apiServer,
        methods: {
            fromToDateString: function () {
                var dateStartString = $filter('formatDate')(this.beginDate, 'date');
                var dateEndString = $filter('formatDate')(this.endDate, 'date');

                if (_.isEqual(dateStartString, dateEndString)) {
                    return dateStartString;
                } else {
                    return dateStartString + ' - ' + dateEndString;
                }
            }
        },
        bypassCache: true,
        cacheResponse: false
    });
    DS.defineResource({
        name: RESOURCE_NAME_USER_APPOINTMENTS,
        endpoint: ENDPOINT_NAME_USER_APPOINTMENTS,
        basePath: config.apiServer,
        methods: {
            fromToDateString: function () {
                var dateStartString = $filter('formatDate')(this.beginDate, 'date');
                var dateEndString = $filter('formatDate')(this.endDate, 'date');

                if (_.isEqual(dateStartString, dateEndString)) {
                    return dateStartString;
                } else {
                    return dateStartString + ' - ' + dateEndString;
                }
            }
        },
        bypassCache: true,
        cacheResponse: false
    });
    DS.defineResource({
        name: RESOURCE_NAME_OPERATION_NOTE,
        endpoint: ENDPOINT_NAME_OPERATION_NOTE,
        basePath: config.apiServer,
        bypassCache: true,
        cacheResponse: false
    });
}];


dataServiceAppointments.$inject = ['$http', '$q', 'config', 'DS', '$translate'];

function dataServiceAppointments($http, $q, config, DS, $translate) {

    var DEFAULT_REQUEST_TIMEOUT = 5000; // 5s
    var apiRequestTimeout = config.apiRequestTimeout || DEFAULT_REQUEST_TIMEOUT;
    var baseURL = config.apiServer;

    var lastAppointmentDateCall = [];
    var lastAppointmentPatientCall = [];
    var offset = 0;

    var service = {
        // Properties
        sortCriteria: [
            { key: 'beginDt', name: 'core.DATE' }
        ],

        // Methods
        getAppointmentsGroupedByPatient: getAppointmentsGroupedByPatient,
        getAppointmentsGroupedByDate: getAppointmentsGroupedByDate,
        getAppointmentsByRoom: getAppointmentsByRoom,
        getAppointmentListForPatient: getAppointmentListForPatient,
        getAppointmentListForPatientCount: getAppointmentListForPatientCount,
        getAppointmentOperationStatus: getAppointmentOperationStatus,
        getOperationNote: getOperationNote,
        setOperationNote: setOperationNote,

        getAppointmentDetails: getAppointmentDetails,
        hasAppointmentData: hasAppointmentData,
        getAppointmentStatusList: getAppointmentStatusList
    };

    return service;

    //BY DATE
    function getAppointmentsGroupedByDate(params, by) {

        offset = params.offset;

        var postData = {
            companyid: params.companyId,
            limit: params.limit,
            offset: params.offset,
            orderby: 'beginDt'
        };

        if (params.fromDate) {
            postData.from = params.fromDate;
        }
        if (params.toDate) {
            postData.to = params.toDate;
        }

        var endpoint;
        var resource;

        if (by === 'location') {
            resource = RESOURCE_NAME_LOCATION_APPOINTMENTS;
            endpoint = ENDPOINT_NAME_LOCATION_APPOINTMENTS;

            if (params.unitId) { postData.patientunit = params.unitId; }
            if (params.serviceId) { postData.hospservice = params.serviceId; }
            if (params.locationNames) { postData.locationnames = params.locationNames; }
        } else {
            resource = RESOURCE_NAME_USER_APPOINTMENTS;
            endpoint = ENDPOINT_NAME_USER_APPOINTMENTS;
        }

        _addLanguageToPostData(postData);

        return DS.findAll(resource, postData, {
            endpoint: endpoint,
            bypassCache: true,
            cacheResponse: false
        })
            .then(function (data) {
                return onAppointmentDateSuccess(data);
            })
            .catch(function (error) {
                // cannot get appointments
            });
    }

    //BY PATIENT
    function getAppointmentsGroupedByPatient(params, by) {

        offset = params.offset;

        var postData = {
            companyid: params.companyId,
            limit: params.limit,
            offset: params.offset,
            orderby: 'pid',
            //by: by //JSData's JSHTTPAdapter is ignoring the endpoint name if params are equal to the previous call and caches the request - keep this property in the code even if not evaluated by MW
        };

        var endpoint;
        var resource;

        if (by === 'location') {
            resource = RESOURCE_NAME_LOCATION_APPOINTMENTS;
            endpoint = ENDPOINT_NAME_LOCATION_APPOINTMENTS;

            if (params.unitId) { postData.patientunit = params.unitId; }
            if (params.serviceId) { postData.hospservice = params.serviceId; }
        } else {
            resource = RESOURCE_NAME_USER_APPOINTMENTS;
            endpoint = ENDPOINT_NAME_USER_APPOINTMENTS;
        }

        _addLanguageToPostData(postData);

        return DS
            .findAll(resource, postData, {
                endpoint: endpoint,
                bypassCache: true,
                cacheResponse: false
            })
            .then(function (data) {
                return onAppointmentPatientSuccess(data);
            })
            .catch(function (error) {
                // cannot get appointments
            });
    }

    /**
     * Get appointments by room
     */
    function getAppointmentsByRoom(params) {

        var postData = {
            companyid: params.companyId,
            limit: params.limit,
            offset: params.offset,
            type: params.type,
            orderby: 'beginDt'
        };

        if (params.unitId) { postData.patientunit = params.unitId; }
        if (params.serviceId) { postData.hospservice = params.serviceId; }

        if (params.fromDate) {
            postData.from = params.fromDate;
        }
        if (params.toDate) {
            postData.to = params.toDate;
        }

        if (params.rooms) {
            postData.rooms = params.rooms;
        }

        if (params.locationNames) { postData.locationnames = params.locationNames; }

        _addLanguageToPostData(postData);

        return DS
            .findAll(RESOURCE_NAME_LOCATION_APPOINTMENTS, postData, {
                endpoint: ENDPOINT_NAME_LOCATION_APPOINTMENTS,
                bypassCache: true,
                cacheResponse: false
            })
            .then(function (data) {
                return onAppointmentByRoomSuccess(data);
            })
            .catch(function (error) {
                // cannot get appointments
            });
    }

    function hasAppointmentData(params) {

        return DS
            .findAll(RESOURCE_NAME_LOCATION_APPOINTMENTS, params, {
                endpoint: ENDPOINT_NAME_LOCATION_APPOINTMENTS + '/count',
                bypassCache: true,
                cacheResponse: false
            })
            .then(function (data) {
                var hasData = false;
                hasData = _.isObject(data) && _.isNumber(data.count) && data.count > 0;

                return hasData;
            })
            .catch(function (error) {
                // cannot get appointments
            });
    }

    function getAppointmentListForPatientCount(params) {

        return DS
            .findAll(RESOURCE_NAME_LOCATION_APPOINTMENTS, params, {
                endpoint: ENDPOINT_NAME_LOCATION_APPOINTMENTS + '/count',
                bypassCache: true,
                cacheResponse: false
            })
            .then(function (data) {
                if (_.isObject(data) && _.isNumber(data.count)) {
                    return data.count;
                } else {
                    return 0;
                }
            })
            .catch(function (error) {
                // cannot get appointments
            });
    }

    function getAppointmentListForPatient(params) {
        // Validate
        if (_.isUndefined(params.pid)) { return $q.reject(new Error('Missing argument pid.')); }

        _addLanguageToPostData(params);

        return DS
            .findAll(RESOURCE_NAME_LOCATION_APPOINTMENTS, params, {
                endpoint: ENDPOINT_NAME_LOCATION_APPOINTMENTS,
                bypassCache: true,
                cacheResponse: false
            });
    }

    function getAppointmentDetails(aid) {
        // Validate
        if (_.isUndefined(aid)) { return $q.reject(new Error('Missing argument aid.')); }

        var options={};
        var postData={};
        _addLanguageToPostData(postData);
        if(postData.language) {
            options.params = postData;
        }

        // APPOINTMENT DETAILS FOR APPOINTMENT-ID
        return DS.find(RESOURCE_NAME_LOCATION_APPOINTMENTS, aid, options);
    }

    function getAppointmentStatusList(companyId, rooms) {
        var endpoint = '/operation/statusByRoom';
        var url = baseURL + ENDPOINT_NAME_LOCATION_APPOINTMENTS + endpoint;

        var deferred = $q.defer();

        if (_.isUndefined(companyId)) {
            deferred.reject('Missing params!');
            return deferred.promise;
        }

        $http({
            method: 'get',
            url: url,
            timeout: apiRequestTimeout,
            params: {
                companyid: companyId,
                rooms
            }
        }).then(function (response) {
            try {
                deferred.resolve(response.data);
            } catch (error) {
                error.response = response.data;
                deferred.reject(error);
            }
        }).catch(function (error) {
            deferred.reject(error);
        });

        return deferred.promise;
    }

    function adaptDataForView(data) {
        var mwAdapter = [];
        _.each(data, function (appointment) {

            var firstlocation = '-';
            if (!_.isUndefined(appointment.locations) && !_.isNull(appointment.locations)) {
                if (appointment.locations.length > 0) {
                    firstlocation = appointment.locations[0].name;
                }
            }

            var firstperson = '-';
            if (!_.isUndefined(appointment.personnels) && !_.isNull(appointment.personnels)) {
                if (appointment.personnels.length > 0) {
                    firstperson = appointment.personnels[0].name;
                }
            }

            //FLU-39
            var operator = undefined;
            var staffs = [];
            if (!_.isUndefined(appointment.personnels) && !_.isNull(appointment.personnels)) {
                operator = _.find(appointment.personnels, (personel) => { return (personel.codeOccupation && personel.codeOccupation === 'Op'); });
                staffs = _.filter(appointment.personnels, (personel) => { return (!personel.codeOccupation) || (personel.codeOccupation && personel.codeOccupation !== 'Op'); });
            }

            var personnelObj = {};
            var personnelString = '-';
            if (!_.isUndefined(appointment.personnels) && !_.isNull(appointment.personnels)) {
                personnelObj = appointment.personnels;
                if (appointment.personnels.length > 0) {
                    var persCount = appointment.personnels.length;
                    personnelString = '';
                    for (var i = 0; i < persCount; i++) {
                        personnelString += appointment.personnels[i].name;
                        if (i < persCount - 1) {
                            personnelString += ', ';
                        }
                    }
                }
            }

            var devicesObj = {};
            var devicesString = '-';
            if (!_.isUndefined(appointment.devices) && !_.isNull(appointment.devices)) {
                devicesObj = appointment.devices;
                if (appointment.devices.length > 0) {
                    var devicesCount = appointment.devices.length;
                    devicesString = '';
                    for (var i = 0; i < devicesCount; i++) {
                        devicesString += appointment.devices[i].name;
                        if (i < devicesCount - 1) {
                            devicesString += ', ';
                        }
                    }
                }
            }

            var locationsObj = {};
            var locationsString = '-';
            if (!_.isUndefined(appointment.locations) && !_.isNull(appointment.locations)) {
                locationsObj = appointment.locations;
                if (appointment.locations.length > 0) {
                    var locationsCount = appointment.locations.length;
                    locationsString = '';
                    for (var i = 0; i < locationsCount; i++) {
                        locationsString += appointment.locations[i].name;
                        if (i < locationsCount - 1) {
                            locationsString += ', ';
                        }
                    }
                }
            }

            // FILL NEW DATA STRUCTURE
            mwAdapter.push({
                'nb_records': appointment.nbRecords,
                'appoint_id': appointment.appointmentId,
                'pid': appointment.patient.pid,
                'patientroom': appointment.visit.patientRoom,
                'visit_nb': appointment.visit.visitNb,
                'begindt': appointment.beginDate,
                'enddt': appointment.endDate,
                'description': appointment.description,
                'firstname': normalizeName(appointment.patient.firstName),
                'lastname': normalizeName(appointment.patient.lastName),
                'maidenname': normalizeName(appointment.patient.maidenName),
                'birthdate': appointment.patient.birthDate,
                'firstlocation': firstlocation,
                'firstperson': firstperson,
                'personnel': personnelString,
                'devices': devicesString,
                'locations': locationsString,
                'personnelObj': personnelObj,
                'devicesObj': devicesObj,
                'locationsObj': locationsObj,
                'type': appointment.appointmentType,
                'patientPosition': appointment.patientPosition,
                'anesthesia': appointment.anesthesia,
                'operator': operator,
                'staffs': staffs
            });
        });
        return mwAdapter;
    }

    /**
     * Get the operation status from an appointment
     * @param {*} params
     */
    function getAppointmentOperationStatus(appointmentId) {
        var deferred = $q.defer();

        if (_.isUndefined(appointmentId)) {
            deferred.reject('Missing params!');
            return deferred.promise;
        }

        var endpoint = 'appointments' + '/' + appointmentId + '/operation/status';
        var url = baseURL + '/' + endpoint;

        $http({
            method: 'get',
            url: url,
            timeout: apiRequestTimeout
        }).then(function (response) {
            try {
                deferred.resolve(response.data);
            } catch (error) {
                error.response = response.data;
                deferred.reject(error);
            }
        }).catch(function (error) {
            deferred.reject(error);
        });

        return deferred.promise;
    }

    function getOperationNote(appointmentId) {
        var deferred = $q.defer();

        if (_.isUndefined(appointmentId)) {
            deferred.reject('Missing params!');
            return deferred.promise;
        }

        var endpoint = ENDPOINT_NAME_OPERATION_NOTE + '/' + appointmentId + '/operation/note';
        var url = baseURL + '/' + endpoint;

        $http({
            method: 'get',
            url: url,
            timeout: apiRequestTimeout
        }).then(function (response) {
            try {
                deferred.resolve(response.data);
            } catch (error) {
                error.response = response.data;
                deferred.reject(error);
            }
        }).catch(function (error) {
            deferred.reject(error);
        });

        return deferred.promise;
    }

    function setOperationNote(appointmentId, note) {
        var deferred = $q.defer();

        if (_.isUndefined(appointmentId)) {
            deferred.reject('Missing params!');
            return deferred.promise;
        }

        var endpoint = ENDPOINT_NAME_OPERATION_NOTE + '/' + appointmentId + '/operation/note';
        var url = baseURL + '/' + endpoint;

        $http({
            method: 'put',
            url: url,
            timeout: apiRequestTimeout,
            params: {
                note: note
            }
        }).then(function (response) {
            try {
                deferred.resolve(response.data);
            } catch (error) {
                error.response = response.data;
                deferred.reject(error);
            }
        }).catch(function (error) {
            deferred.reject(error);
        });

        return deferred.promise;
    }

    function onAppointmentDateSuccess(data) {
        data = adaptDataForView(data);

        if (offset === 0) {
            lastAppointmentDateCall = [];
        }
        return _.memoize(function (data) {
            _.each(data, function (entry) {
                lastAppointmentDateCall.push(entry);
            });
            return lastAppointmentDateCall;
        })(data);
    }

    function onAppointmentByRoomSuccess(data) {
        var locations = _.groupBy(data, (appointment) => {
            if (appointment && appointment.locations) {
                return _.head(appointment.locations).name;
            }
        });

        var orderedLocations = {};
        _(locations).keys().sort().each(function (key) {
            if (key != 'undefined') {
                orderedLocations[key] = locations[key];
            }
        });

        //Adapt data to the view
        _.each(orderedLocations, function (appointments, index) {
            orderedLocations[index] = adaptDataForView(appointments);
        });

        return orderedLocations;
    }

    /**
     * Private function
     */
    function onAppointmentPatientSuccess(data) {

        data = adaptDataForView(data);

        if (offset === 0) {
            lastAppointmentPatientCall = [];
        }
        return _.memoize(function (data) {
            // separate data by room
            _.each(data, function (entry) {
                lastAppointmentPatientCall.push(entry);
            });
            var groupedData = [];
            var groupedRoom = _.groupBy(lastAppointmentPatientCall, function (entry) {
                return entry.patientroom;
            });
            _.each(groupedRoom, function (roomValue, roomKey) {
                var currentGroupedPatient = [];
                var groupedPatient = [];

                currentGroupedPatient = _.groupBy(roomValue, function (entry) {
                    return entry.pid;
                });

                _.each(currentGroupedPatient, function (patientValue, patientKey) {
                    var patient = patientValue[0];
                    groupedPatient.push({
                        'id': patient['pid'],
                        'firstname': patient['firstname'],
                        'lastname': patient['lastname'],
                        'appointments': _.sortBy(patientValue, 'begindt'),
                        'nb_records': patient['nb_records']
                    });
                });

                groupedData.push({
                    room: roomKey,
                    patients: groupedPatient
                });
            });
            return groupedData;
        })(data);
    }

    /**
     * private method
     **/
    function normalizeName(name) {
        if (name !== null) {
            return name.replace(/([^\W_]+[^\s-]*) */g, function (txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
        } else {
            return null;
        }
    }

    function _addLanguageToPostData(postData) {
        if($translate && $translate.use()) {
            postData.language = $translate.use();
        }
    }
}

export {
    dataServiceAppointments,
    run
}

