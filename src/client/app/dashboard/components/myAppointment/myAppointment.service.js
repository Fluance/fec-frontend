// jscs:disable requireParenthesesAroundIIFE
// Turn off jshint rules:
/*jshint -W101*/ //  Line too long
(function () {
    'use strict';

    var componentName = 'MyAppointmentComponent';

    angular
        .module('app.dashboard')
        .service(componentName, MyAppointmentComponent);

    MyAppointmentComponent.$inject = [
        '$rootScope',
        '$filter',
        '$state',
        '$window',
        '$q',
        'sessionService',
        'dataservice.companies',
        'dataservice.appointments',
        'logger',
        'dataservice.patients',
        'dataservice.visits',
        'layoutService',
        'userAgentService'
    ];

    /**
     * @ngdoc service
     * @module dashboard
     * @name MyAppointmentComponent
     * @description
     *
     * This is a dashboard object. Allow you to create an object.
     *
     */
    function MyAppointmentComponent(
        $rootScope,
        $filter,
        $state,
        $window,
        $q,
        session,
        dataServiceCompanies,
        dataServiceAppointments,
        logger,
        dataservicePatient,
        dataServiceVisits,
        layoutService,
        userAgent
    ) {

        return function (params) {
            var WINDOW_WIDTH = 1024;

            var isExpanded = true;
            var rawDataDates, rawDataPatients;
            var scope = {};

            // Customize
            if (params.by && params.by === 'user') {
                angular.extend(scope, {
                    className: 'byUserAppointments',
                    title: 'dashboard.MY_AGENDA_BYUSER_TITLE',
                });
            } else if (params.by && params.by === 'location') {
                angular.extend(scope, {
                    className: 'byLocationAppointments',
                    title: 'dashboard.MY_AGENDA_TITLE',
                });
            } else {
                throw new Error('missing parameter on MyAppointmentComponent initialisation');
            }

            //var dataService = params.by === 'user' ? dataServiceUserAppoinments : dataServiceAppointments;
            var dataService = dataServiceAppointments;
            scope.params = params;

            // Add logger to display report
            scope.logger = logger;

            // Number of appointments per page
            var numberAppointmentperPage = isExpanded === true ? 10 : 5;
            // max number of Appointments displayed on page (0=all)
            var maxAppointments = 5;

            scope.user = session.user;
            scope.hasMoreData = false;
            scope.hasUnitOrService = false;
            scope.hasData = false;
            scope.showCalendarDate = true;
            scope.showCalendarPatient = false;
            scope.unitId = 'ALL';
            scope.hospserviceId = 'ALL';
            scope.globalDataCounter = 0;
            scope.initializing = true;

            scope.appointmentsDate = [];
            scope.appointmentsPatient = [];

            // Page counter
            var page = 0;
            scope.page = page;
            scope.maxAppointments = 0;

            // company id
            scope.companyId = scope.user.companyId;

            scope.templateUrl = 'app/dashboard/components/myAppointment/myAppointment.tpl.content.html';
            scope.templateUrlExp = 'app/dashboard/components/myAppointment/myAppointment.tpl.content.exp.html';
            scope.searchText = '';
            scope.navBarInit = 'calendar-date';

            // Scrollable container (relevant for infinite-scroll)
            scope.scrollableContainer = layoutService.getScrollableContainer();

            // Functions for the UI sorted by name
            scope.changeTab = changeTab;
            scope.goToPatient = goToPatient;
            scope.goToAppointment = goToAppointment;
            scope.initialize = initialize;
            scope.isMobile = userAgent.isMobileSize;
            scope.loadData = loadData;
            scope.onTranslateChange = onTranslateChange;
            scope.onCompanyChange = onCompanyChange;
            scope.toggleSettings = toggleSettings;

            function changeTab(selectedTab) {
                switch (selectedTab) {
                    case 'calendar-patient':
                        scope.showCalendarDate = false;
                        scope.showCalendarPatient = true;
                        scope.navBarInit = 'calendar-patient';
                        break;

                    case 'calendar-date':
                        scope.showCalendarPatient = false;
                        scope.showCalendarDate = true;
                        scope.navBarInit = 'calendar-date';
                        break;
                }
                initialize();
            }

            function configureTutorial() {
                var steps = [];

                if (params.by === 'user') {
                    steps.push({
                        element: '.appointment-by-user-title',
                        introKey: 'dashboard.GUIDE_MY_AGENDA_EXPANDED',
                        position: 'bottom-middle-aligned',
                        isValid: function () {
                            return isExpanded;
                        }
                    });
                } else if (params.by === 'location') {
                    steps.push({
                        element: '.my-appointment-title',
                        introKey: 'dashboard.GUIDE_PATIENT_APPOINTMENTS_EXPANDED',
                        position: 'bottom-middle-aligned',
                        isValid: function () {
                            return isExpanded;
                        }
                    }, {
                        element: '.select-scheduler-unit',
                        introKey: 'dashboard.GUIDE_SELECT_SCHEDULER_UNIT',
                        position: 'bottom-middle-aligned',

                        isValid: function () {
                            return isExpanded;
                        }
                    }, {
                        element: '.select-scheduler-hospservice',
                        introKey: 'dashboard.GUIDE_SELECT_SCHEDULER_HOSPSERVICE',
                        position: 'bottom-middle-aligned',

                        isValid: function () {
                            return isExpanded;
                        }
                    });
                }

                //tutorialService.setSteps(componentName, 0, steps);
            }

            /**
             * Cut the display name in given length depend on screensize
             * @param  {String} elementId   Element ID
             * @param  {Array} elementList List with elements
             * @param  {number} cutSize     Size of the cutted string
             * @return {String}             Cutted string
             */
            function cutElementName(elementId, elementList, cutSize) {
                if ($window.innerWidth < WINDOW_WIDTH) {
                    return elementId;
                } else if (elementList && elementList[elementId]) {
                    var returnValue = elementId + ' - ' + elementList[elementId];
                    if (returnValue.length > cutSize) {
                        return returnValue.slice(0, cutSize) + '...';
                    } else {
                        return returnValue;
                    }
                } else {
                    return elementId;
                }
            }

            function getIdArray(id, items, idPropertyName) {
                var returnValue = null;
                if (id === 'ALL' && !_.isEmpty(items)) {
                    returnValue = _.map(items, idPropertyName);
                } else if (!_.isNil(id) && id !== 'ALL') {
                    returnValue = [id];
                }
                return returnValue;
            }

            /**
             * Go to the patient
             * @param  {number} patientId Patient ID
             */
            function goToPatient(patientId) {
                $state.go('patient', {
                    pid: patientId
                });
            }


            /**
             * Go to the appointment
             * @param  {number} appointmentId Appointment ID
             */
            function goToAppointment(appointmentId) {
                $state.go('appointment', {
                    aid: appointmentId
                });
            }

            function initialize() {

                // reset initial state
                page = -1;
                scope.page = page;
                scope.error = null;
                scope.warning = null;
                scope.appointmentsDate = [];
                scope.appointmentsPatient = [];
                scope.loadData();
            }

            // function loadData() {
            //     scope.spin = true;
            //     page = page + 1;
            //     scope.page = page;
            //     $q.all([loadAppointments()]).finally(function (t) {
            //         scope.spin = false;
            //         scope.initializing = false;
            //     });
            // }

            /**
             * Get all appointments for the "date" and "patient" tab and structure it
             */
            function loadAppointmentsSortByDate() {
                return $q(function (resolve, reject) {

                    page = page >= 0 ? page : 0;
                    scope.maxAppointments = 0;

                    var unitIdArray = getIdArray(scope.unitId, scope.units, 'code');
                    var hospserviceIdArray = getIdArray(scope.hospserviceId, scope.hospservices, 'code');

                    if (!!unitIdArray || !!hospserviceIdArray) {
                        scope.spin = true;

                        var appointParams = {
                            unitId: unitIdArray,
                            serviceId: hospserviceIdArray,
                            companyId: session.user.companyId,
                            searchTextArray: scope.searchTextArray,
                            limit: numberAppointmentperPage,
                            offset: page * numberAppointmentperPage
                        };

                        // Get the appointments for the "date" tab
                        dataService.getAppointmentsGroupedByDate(appointParams, params.by)
                            .then(function (data) {

                                // TODO : to optimize
                                // Adds month to entries
                                _.each(data, function (entry, index, list) {
                                    entry.monthDate = $filter('formatMoment')(entry.begindt, 'YYYY-MM');
                                    entry.fullDate = $filter('formatMoment')(entry.begindt, 'YYYY-MM-DD');
                                });

                                // Check if an entry starts to a new month
                                _.each(data, function (entry, index, list) {
                                    entry.startMonth = index ?
                                        (list[index - 1].monthDate !== entry.monthDate) :
                                        true;
                                });

                                // Check if an entry ends a month
                                _.each(data, function (entry, index, list) {
                                    entry.endMonth = index === (list.length - 1) ?
                                        true :
                                        (list[index + 1].monthDate !== entry.monthDate);
                                });

                                // Check if an entry starts to a new day
                                _.each(data, function (entry, index, list) {
                                    entry.startDay = index ?
                                        (list[index - 1].fullDate !== entry.fullDate) :
                                        true;
                                });

                                // Check if an entry ends a day
                                _.each(data, function (entry, index, list) {
                                    entry.endDay = index === (list.length - 1) ?
                                        true :
                                        (list[index + 1].fullDate !== entry.fullDate);
                                });

                                return data;

                            })
                            .then(function (data) {
                                /*
                                    If datasDate.isEmpty, there are NO results for this unit/service
                                    (if the offset is zero), if offset > 0 there are no more datasDate
                                 */

                                if (data && data.length !== 0) {
                                    scope.maxAppointments = _.first(data)['nb_records'];
                                    //scope.appointmentsDate = sortAppointmentsByDate(datasDate, maxAppointments).data;
                                    scope.appointmentsDate = data;
                                } else {
                                    if (page === 0) {
                                        // SHOW NO RESULT FOR SORT BY DATE
                                        scope.appointmentsDate = [];
                                    }
                                }
                                resolve();
                            })
                            .catch(function (exception) {
                                logger
                                    .sendReport(exception, exception.message)
                                    .then(function (index) {
                                        handleError(index, exception);
                                        reject(exception);
                                    });
                            })
                            .finally(function () {
                                // Calculate has-more-data
                                scope.hasMoreData = (scope.maxAppointments > ((page + 1) * numberAppointmentperPage));
                                scope.hasData = scope.appointmentsDate && scope.appointmentsDate.length > 0;
                                scope.spin = false;
                                scope.initializing = false;
                            });
                    } else {
                        scope.appointmentsDate = [];
                        scope.hasMoreData = false;
                        scope.hasData = false;
                        scope.spin = false;
                        scope.initializing = false;
                    }
                });
            }

            /**
             * Get all appointments for the "date" and "patient" tab and structure it
             */
            function loadAppointmentsSortByPatientroom() {

                return $q(function (resolve, reject) {

                    page = page >= 0 ? page : 0;
                    scope.maxAppointments = 0;

                    var unitIdArray = getIdArray(scope.unitId, scope.units, 'code');
                    var hospserviceIdArray = getIdArray(scope.hospserviceId, scope.hospservices, 'code');

                    if (!!unitIdArray || !!hospserviceIdArray) {
                        scope.spin = true;
                        // Get the appointments for the "patient" tab
                        var appointParams = {
                            unitId: unitIdArray,
                            serviceId: hospserviceIdArray,
                            companyId: session.user.companyId,
                            searchTextArray: scope.searchTextArray,
                            limit: numberAppointmentperPage,
                            offset: page * numberAppointmentperPage
                        };

                        dataService.getAppointmentsGroupedByPatient(appointParams, params.by)
                            .then(function (groupedData) {
                                /*
                                    If datasDate.isEmpty then, there are NO results for this unit/service
                                    (if the offset is zero), if offset > 0 there are no more datasDate
                                 */
                                if (groupedData) {

                                    // Flatten entries
                                    var data = [];
                                    var currentRoom;
                                    var currentPatient;

                                    // For each room
                                    _.each(groupedData, function (room, roomIndex, roomList) {

                                        // Keep a reference of current room;
                                        currentRoom = room;

                                        // For each patient
                                        _.each(room.patients, function (patient, patientIndex, patientList) {

                                            // Keep a reference of current patient;
                                            currentPatient = patient;

                                            // For each appointement
                                            _.each(patient.appointments, function (appointment, appointmentIndex, appointementList) {

                                                // create a full patient name attribute in appointment
                                                appointment.patientName = currentPatient.firstname + currentPatient.lastname;
                                                appointment.roomName = currentRoom.room;

                                                // Append appointment to flat list;
                                                data.push(appointment);
                                            });
                                        });
                                    });

                                    // TODO : to optimize
                                    // Adds month to entries
                                    _.each(data, function (entry, index, list) {
                                        entry.monthDate = $filter('formatMoment')(entry.begindt, 'YYYY-MM');
                                        entry.fullDate = $filter('formatMoment')(entry.begindt, 'YYYY-MM-DD');
                                    });

                                    // Check if an entry starts to a new room
                                    _.each(data, function (entry, index, list) {
                                        entry.startRoom = index ?
                                            (list[index - 1].roomName !== entry.roomName) :
                                            true;
                                    });

                                    // Check if an entry ends a room
                                    _.each(data, function (entry, index, list) {
                                        entry.endRoom = index === (list.length - 1) ?
                                            true :
                                            (list[index + 1].roomName !== entry.roomName);
                                    });

                                    // Check if an entry starts to a new patient
                                    _.each(data, function (entry, index, list) {
                                        entry.startPatient = index ?
                                            (list[index - 1].patientName !== entry.patientName) :
                                            true;
                                    });

                                    // Check if an entry ends a patient
                                    _.each(data, function (entry, index, list) {
                                        entry.endPatient = index === (list.length - 1) ?
                                            true :
                                            (list[index + 1].patientName !== entry.patientName);
                                    });

                                    // Check if an entry starts to a new month
                                    _.each(data, function (entry, index, list) {
                                        entry.startMonth = index ?
                                            (list[index - 1].monthDate !== entry.monthDate) :
                                            true;
                                    });

                                    // Check if an entry ends a month
                                    _.each(data, function (entry, index, list) {
                                        entry.endMonth = index === (list.length - 1) ?
                                            true :
                                            (list[index + 1].monthDate !== entry.monthDate);
                                    });

                                    // Check if an entry starts to a new day
                                    _.each(data, function (entry, index, list) {
                                        entry.startDay = index ?
                                            (list[index - 1].fullDate !== entry.fullDate) :
                                            true;
                                    });

                                    // Check if an entry ends a day
                                    _.each(data, function (entry, index, list) {
                                        entry.endDay = index === (list.length - 1) ?
                                            true :
                                            (list[index + 1].fullDate !== entry.fullDate);
                                    });
                                } else {
                                    data = [];
                                }

                                return data;
                            })
                            .then(function (data) {
                                /*
                                    If datasDate.isEmpty, there are NO results for this unit/service
                                    (if the offset is zero), if offset > 0 there are no more datasDate
                                 */

                                if (data.length !== 0) {
                                    scope.maxAppointments = _.first(data)['nb_records'];
                                    //scope.appointmentsDate = sortAppointmentsByDate(datasDate, maxAppointments).data;
                                    scope.appointmentsPatient = data;
                                } else {
                                    if (page === 0) {
                                        scope.appointmentsPatient = [];
                                    }
                                }
                                resolve();
                            })

                            .catch(function (exception) {
                                logger
                                    .sendReport(exception, exception.message)
                                    .then(function (index) {
                                        handleError(index, exception);
                                        reject(exception);
                                    });
                            })
                            .finally(function () {
                                // Calculate has-more-data
                                scope.hasMoreData = (scope.maxAppointments > ((page + 1) * numberAppointmentperPage));
                                scope.hasData = scope.appointmentsPatient && scope.appointmentsPatient.length > 0;
                                scope.spin = false;
                                scope.initializing = false;
                            });
                    } else {
                        scope.appointmentsPatient = [];
                        scope.hasMoreData = false;
                        scope.hasData = false;
                        scope.spin = false;
                        scope.initializing = false;
                    }
                });
            }

            function handleError(index, exception) {
                if (angular.isDefined(exception.status) && exception.status === 401) {
                    scope.error = undefined;
                    scope.warning = {
                        'message': 'error.HTTP_FORBIDDEN',
                        'tryagain': false
                    };
                } else if (angular.isDefined(exception.status) && exception.status === 403) {
                    scope.error = undefined;
                    scope.warning = {
                        'message': 'dashboard.MY_AGENDA_NO_STAFFID',
                        'tryagain': false
                    };
                } else if (angular.isDefined(exception.status) && exception.status === 500) {
                    scope.warning = undefined;
                    scope.error = {
                        'message': 'error.HTTP_SERVER',
                        'tryagain': true
                    };
                } else {
                    scope.warning = undefined;
                    scope.error = {
                        'message': exception.message,
                        'tryagain': true
                    };
                }
                if (index !== null && index !== undefined) {
                    if (scope.error !== undefined) {
                        scope.error.report = index;
                    }
                }
            }

            function loadData() {
                scope.spin = true;

                page = page + 1;
                scope.page = page;
                if (scope.showCalendarDate) {
                    $q.all(
                        [loadAppointmentsSortByDate()]
                    ).finally(function (t) {
                        scope.spin = false;
                        scope.initializing = false;
                    });
                } else if (scope.showCalendarPatient) {
                    $q.all(
                        [loadAppointmentsSortByPatientroom()]
                    ).finally(function (t) {
                        scope.spin = false;
                        scope.initializing = false;
                    });
                }
            }

            function loadUnitsAndServices() {
                scope.hasUnitOrService = false;

                // List of units
                scope.units = session.getSelectedCompanyUnits();
                // List of hospservices
                scope.hospservices = session.getSelectedCompanyHospServices();

                if( (!_.isNil(scope.units) && scope.units.length > 0) || (!_.isNil(scope.hospservices) && scope.hospservices.length > 0)){
                    scope.hasUnitOrService = true;
                }

                initialize();
            }

            /**
             * Turn a Object to an array
             * @param  {Object} obj Object
             * @return {Array}     array
             */
            function objectToArray(obj) {
                var returnValue = [];
                for (var key in obj) {
                    if (key !== null || key !== undefined) {
                        returnValue.push({
                            date: key,
                            data: obj[key]
                        });
                    }
                }
                return returnValue;
            }

            // to fire it on company changes
            function onCompanyChange() {
                // Reset user choose
                scope.unitId = 'ALL';
                scope.hospserviceId = 'ALL';
                loadUnitsAndServices();
            }

            //In expanded view we reload appointments list and reset Unit, Service and Sorting list (by date as default)
            function onExpandedViewAppList() {
                initialize();
            }

            // to fire it on translate changes
            function onTranslateChange() {
                if (!isExpanded) {
                    loadUnitsAndServices();
                } else {
                    onExpandedViewAppList();
                }
            }

            function search() {
                if (scope.searchText && scope.searchText.length >= 1) {
                    if (scope.searchText.indexOf(',') > -1) {
                        scope.searchTextArray = scope.searchText.split(',');
                        scope.searchTextArray = _.map(scope.searchTextArray, function (searchTextEntry) {
                            return searchTextEntry.trim();
                        });
                    } else {
                        scope.searchTextArray = [];
                        scope.searchTextArray.push(scope.searchText.trim());
                    }
                    loadAppointmentsSortByDate();
                    loadAppointmentsSortByPatientroom();
                }
            }

            /*function tryagain() {
                loadFirstData();
            }*/

            // set sorting state
            function setStateSorting(isSorting) {
                scope.isStateSorting = isSorting;
            }

            function toggleSettings() {
                scope.showSettings = !scope.showSettings;
            }

            return {
                // SOME DATA, NOT REQUIRED
                name: componentName,
                params: params,
                scope: scope,
                states: {
                    'default': {
                        template: 'app/dashboard/components/myAppointment/myAppointment.tpl.html',
                        controller: function () {
                            isExpanded = false;
                            numberAppointmentperPage = 5;
                            maxAppointments = 5;

                            loadUnitsAndServices();

                            //if (tutorialService.isActive()) {
                            //    tutorialService.current(tutorialService.CHAPTER_NAME_MY_COCKPIT);
                            //}
                        },
                        refreshStateSorting: function (isSorting) {
                            // set isStateSorting in scope (to display draggable layer)
                            if (!_.isUndefined(isSorting) && _.isBoolean(isSorting)) {
                                setStateSorting(isSorting);
                            }
                        }
                    },
                    'extended': {
                        template: 'app/dashboard/components/myAppointment/myAppointment.tpl.extended.html',
                        controller: function () {
                            isExpanded = true;
                            numberAppointmentperPage = 10;
                            maxAppointments = 0; // al

                            onExpandedViewAppList();
                            //if (tutorialService.isActive()) {
                            //    // Configure tutorials
                            //    configureTutorial();
                            //    tutorialService.current(componentName);
                            //}
                        }
                    }
                }
            };
        };
    }
})();
