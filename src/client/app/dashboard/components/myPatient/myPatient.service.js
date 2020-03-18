// jscs:disable requireParenthesesAroundIIFE
// Turn off jshint rules:
/*jshint -W101*/ //  Line too long
(function () {
    'use strict';

    var componentName = 'MyPatientComponent';

    angular
        .module('app.dashboard')
        .service(componentName, MyPatientComponent);

    MyPatientComponent.$inject = [
        'sessionService',
        '$rootScope',
        'dataservice.patients',
        'logger',
        '$q',
        '$filter',
        'userAgentService'
    ];

    /**
     * @ngdoc service
     * @module dashboard
     * @name MyPatientComponent
     * @description
     *
     * This is a dashboard object. Allow you to create an object.
     *
     */
    function MyPatientComponent(
        session,
        $rootScope,
        dataServicePatients,
        logger,
        $q,
        $filter,
        userAgentService
    ) {

        return function (params) {

            // Keep state of myPatient
            var isExpanded = false;
            // Scope connect controller and template
            var scope = {};

            //Default status max number of patient to show
            var DEFAULT_MAX_PATIENTS = 5;

            // Number of patient per page
            var NUMBER_PATIENTS_BY_PAGE = 10;

            //Dynamic scroll size
            var SCROLL_ELEMENT_SELECTOR = '.my-patient-scroll-wrap';
            var LISTED_ELEMENT_HEIGHT = 140;

            scope.defaultMaxPatients = DEFAULT_MAX_PATIENTS;
            // enable/disable preloader animation
            scope.spin = false;
            // containe error message as String
            scope.error = null;
            scope.errorNoPatients = 'dashboard.NO_PATIENTS';
            scope.warning = null;

            scope.user = session.user;

            scope.page = 0;
            scope.pageWeek = 0;
            // Logger to access showReport function
            scope.logger = logger;

            // Patient data to display
            scope.patients = [];
            scope.patientsWeek = [];

            // Functions for the UI
            scope.isMobile = userAgentService.isMobileSize;
            scope.hasData = hasData;
            scope.hasDataDay = hasDataDay;
            scope.hasDataWeek = hasDataWeek;
            scope.hasMoreDataDay = hasMoreDataDay;
            scope.hasMoreDataWeek = hasMoreDataWeek;
            scope.hasScroll = hasScroll;
            scope.loadDataDay = loadDataDay;
            scope.loadDataWeek = loadDataWeek;
            scope.onCompanyChange = init;

            scope.tryagain = init;

            //if (tutorialService.isActive()) {
            //    // Configure tutorials
            //    configureTutorial();
            //}

            function init() {
                scope.error = null;
                scope.warning = null;

                scope.page = -1;
                scope.patients = [];
                scope.totalPatients = undefined;

                scope.spinDay = false;

                //for not expanded view load data by default
                loadDataDay();
            }

            function initExpanded() {
                // reset initial state
                scope.error = null;
                scope.warning = null;

                scope.page = -1;
                scope.patients = [];
                scope.totalPatients = undefined;

                scope.patientsWeek = [];
                scope.pageWeek = -1;
                scope.totalPatientsWeek = undefined;

                scope.spinDay = false;
                scope.spinWeek = false;
            }

            function configureTutorial() {
                tutorialService
                    .setSteps(componentName, 0, [{
                        element: '.my-patient-title',
                        introKey: 'dashboard.GUIDE_MY_PATIENT_TITLE_EXPANDED',
                        position: 'bottom-middle-aligned'
                    }, {
                        element: '#myPatientsToday',
                        introKey: 'dashboard.GUIDE_MY_PATIENTS_TODAY',
                        position: 'floating',
                        isValid: function () {
                            return isExpanded && scope.patients.length > 0;
                        }
                    }, {
                        element: '#myPatientsThisWeek',
                        introKey: 'dashboard.GUIDE_MY_PATIENTS_THIS_WEEK',
                        position: 'floating',
                        isValid: function () {
                            return isExpanded && scope.patients.length > 0;
                        }
                    }]);
            }

            function loadDataDay() {
                scope.spinDay = true;

                if (hasMoreDataDay()) {
                    _loadPatientsDay().then(function (data) {
                        //Patients for the day
                        if (!_.isUndefined(data) && data['nb_records'] && data['patients']) {
                            scope.totalPatients = data['nb_records'];
                            scope.patients = _.union(scope.patients, data.patients);
                        } else {
                            scope.totalPatients = 0;
                            scope.patients = [];
                        }
                    }).catch(function (exception) {
                        logger
                            .sendReport(exception, exception.message)
                            .then(function (index) {
                                _handleError(index, exception);
                            });

                    }).finally(function () {
                        scope.spinDay = false;
                    });
                }
            }

            function loadDataWeek() {
                scope.spinDayWeek = true;

                if (hasMoreDataWeek()) {
                    _loadPatientsWeek().then(function (data) {
                        //Patients for the week
                        if (!_.isUndefined(data) && data['nb_records'] && data['patients']) {
                            scope.totalPatientsWeek = data['nb_records'];
                            scope.patientsWeek = _.union(scope.patientsWeek, data.patients);
                        } else {
                            scope.totalPatientsWeek = 0;
                            scope.patientsWeek = [];
                        }
                    }).catch(function (exception) {
                        logger
                            .sendReport(exception, exception.message)
                            .then(function (index) {
                                _handleError(index, exception);
                            });

                    }).finally(function () {
                        scope.spinDayWeek = false;
                    });
                }
            }

            function hasData() {
                return hasDataDay() || hasDataWeek();
            }

            function hasDataDay() {
                return (scope.patients && scope.patients.length && scope.patients.length > 0);
            }

            function hasDataWeek() {
                return (scope.patientsWeek && scope.patientsWeek.length && scope.patientsWeek.length > 0);
            }

            function hasScroll() {
                if (userAgentService.isSafari() || userAgentService.isMacOS() || userAgentService.isIOS()) {
                    return false;
                } else {
                    //Maximum results before scroll
                    var scrollThreshold = 3;

                    //Get element with scroll
                    var element = angular.element(document.querySelector(SCROLL_ELEMENT_SELECTOR));
                    //Get height of the element
                    var height = element[0].offsetHeight;

                    scrollThreshold = height / LISTED_ELEMENT_HEIGHT;
                    //Get absolute value equals max number of elements before scroll
                    scrollThreshold = Math.floor(scrollThreshold);

                    return (hasDataDay() && scope.patients.length > scrollThreshold) || (hasDataWeek() && scope.patientsWeek.length > scrollThreshold);
                }
            }

            function hasMoreDataDay() {
                return _.isUndefined(scope.totalPatients) || (scope.totalPatients > 0 && scope.patients.length < scope.totalPatients);
            }

            function hasMoreDataWeek() {
                return _.isUndefined(scope.totalPatientsWeek) || (scope.totalPatientsWeek > 0 && scope.patientsWeek.length < scope.totalPatientsWeek);
            }

            function _loadPatientsDay() {
                scope.page = scope.page + 1;

                return dataServicePatients
                    .getPatientForPhysician({
                        companyid: session.user.companyId,
                        limit: NUMBER_PATIENTS_BY_PAGE,
                        offset: scope.page * NUMBER_PATIENTS_BY_PAGE
                    });
            }

            function _loadPatientsWeek() {
                scope.pageWeek = scope.pageWeek + 1;

                return dataServicePatients.getPatientForPhysician({
                    companyid: session.user.companyId,
                    limit: NUMBER_PATIENTS_BY_PAGE,
                    offset: scope.pageWeek * NUMBER_PATIENTS_BY_PAGE,
                    patientview: 'week'
                });
            }

            function _handleError(index, exception) {
                if (angular.isDefined(exception.status) && exception.status === 401) {
                    scope.error = undefined;
                    scope.warning = {
                        'message': 'error.HTTP_FORBIDDEN',
                        'tryagain': false
                    };
                } else if (angular.isDefined(exception.status) && exception.status === 403) {
                    scope.error = undefined;
                    scope.warning = {
                        'message': 'dashboard.MY_UNIT_NO_STAFFID',
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

                // If there are some reports in the history
                if (scope.history !== undefined) {
                    // And if it's not a missing Staff ID
                    if (scope.warning.message !== 'dashboard.MY_UNIT_NO_STAFFID') {
                        // We set the last error in the displayed report
                        if (scope.error !== undefined) {
                            scope.error.report = index;
                        }
                    }
                }
            }

            // set sorting state
            function _setStateSorting(isSorting) {
                scope.isStateSorting = isSorting;
            }

            return {
                // SOME DATA, NOT REQUIRED
                name: componentName,
                params: params,
                scope: scope,
                states: {
                    'default': {
                        template: 'app/dashboard/components/myPatient/myPatient.tpl.html',
                        controller: function () {
                            isExpanded = false;
                            if (!scope.isMobile()) {
                                init();
                                //tutorialService.current(tutorialService.CHAPTER_NAME_MY_COCKPIT);
                            }
                        },
                        refreshStateSorting: function (isSorting) {
                            // set isStateSorting in scope (to display draggable layer)
                            if (!_.isUndefined(isSorting) && _.isBoolean(isSorting)) {
                                _setStateSorting(isSorting);
                            }
                        }
                    },
                    'extended': {
                        template: 'app/dashboard/components/myPatient/myPatient.tpl.extended.html',
                        controller: function () {
                            isExpanded = true;
                            initExpanded();
                            //tutorialService.current(componentName);
                        }
                    }
                }
            };
        };
    }
})();
