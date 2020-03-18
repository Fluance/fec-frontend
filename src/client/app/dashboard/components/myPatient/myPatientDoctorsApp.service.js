// jscs:disable requireParenthesesAroundIIFE
// Turn off jshint rules:
/*jshint -W101*/ //  Line too long
(function () {
    'use strict';

    var componentName = 'MyPatientComponent';
    var serviceName = 'MyPatientComponent';

    angular
        .module('app.dashboard')
        .service(serviceName, MyPatientComponent);

    MyPatientComponent.$inject = [
        '$filter',
        '$q',
        '$rootScope',
        'dataservice.patients',
        'logger',
        'sessionService',
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
        $filter,
        $q,
        $rootScope,
        dataServicePatients,
        logger,
        session,
        userAgent
    ) {

        return function (params) {
            var DEFAULT_ENTRIES_LIMIT = 5;

            // Filter: Order by
            var ORDERBY_NAME = 'orderby-name';
            var ORDERBY_ROOM = 'orderby-room';
            var ORDERBY_UNIT = 'orderby-unit';
            var ORDERBY_DATE = 'orderby-date';

            var SORTORDER_ASC = 'asc';
            var SORTORDER_DESC = 'desc';

            // Keep state of myPatient
            var isExpanded = false;
            // Scope connect controller and template
            var scope = {};

            // filter
            scope.orderByName = ORDERBY_NAME;
            scope.orderByRoom = ORDERBY_ROOM;
            scope.orderByUnit = ORDERBY_UNIT;
            scope.orderByDate = ORDERBY_DATE;

            // default selected filter
            scope.tabOrderBy = ORDERBY_ROOM;
            scope.orderby = 'patientroom';
            scope.sortorder = SORTORDER_ASC;

            // enable/disable preloader animation
            scope.spin = false;
            // containe error message as String
            scope.error = null;
            scope.errorNoPatients = 'dashboard.NO_PATIENTS';
            scope.warning = null;
            scope.hasData = false;

            scope.user = session.user;

            // Logger to access showReport function
            scope.logger = logger;

            // Patient data to display
            scope.datas = [];
            scope.datasWeek = [];
            scope.nbrEntries = 0;
            scope.nbrEntriesMore = 0;
            scope.defaultEntriesLimit = DEFAULT_ENTRIES_LIMIT;

            // API
            scope.isntExpandable = isntExpandable;
            scope.showMoreEntries = showMoreEntries;
            scope.showLessEntries = showLessEntries;
            scope.allEntriesVisible = allEntriesVisible;
            scope.calculatePatientAge = calculatePatientAge;
            scope.isMobile = userAgent.isMobileSize;
            scope.changeTab = onChangeTab;
            scope.tryagain = loadPatient;

            $rootScope.$on(session.EVENT_SELECTED_COMPANY_CHANGED, function () {
                loadPatient();
            });

            return {
                // SOME DATA, NOT REQUIRED
                name: componentName,
                params: params,
                scope: scope,
                states: {
                    'default': {
                        template: 'app/dashboard/components/myPatient/myPatientDoctorsApp.tpl.html',
                        controller: function () {
                            isExpanded = false;
                            if (!scope.isMobile()) {
                                scope.nbrEntries = DEFAULT_ENTRIES_LIMIT;
                                loadPatient();
                            }
                        },
                        refreshStateSorting: function (isSorting) {
                            // set isStateSorting in scope (to display draggable layer)
                            if (!_.isUndefined(isSorting) && _.isBoolean(isSorting)) {
                                setStateSorting(isSorting);
                            }
                        }
                    }
                }
            };

            // --------------------------------------------------------------

            function onChangeTab(selectedTab) {
                switch (selectedTab) {
                    case ORDERBY_NAME:
                        scope.orderby = 'lastName';
                        scope.sortorder = SORTORDER_ASC;
                        break;
                    case ORDERBY_ROOM:
                        scope.orderby = 'patientroom';
                        scope.sortorder = SORTORDER_ASC;
                        break;
                    case ORDERBY_UNIT:
                        scope.orderby = 'patientunit';
                        scope.sortorder = SORTORDER_ASC;
                        break;
                    case ORDERBY_DATE:
                        scope.orderby = 'admitdt';
                        scope.sortorder = SORTORDER_DESC;
                        break;
                }
                loadPatient();
            }

            // --------------------------------------------------------------

            function loadPatient() {
                // reset initial state
                scope.error = null;
                scope.warning = null;

                scope.datas = [];
                scope.datasWeek = [];
                loadData();
            }

            function loadData() {
                scope.spin = true;

                $q.all(
                    [loadPatientDay()]
                ).then(function (t) {
                    // To do nothing
                }).catch(function (exception) {
                    // To do nothing
                }).finally(function () {
                    scope.spin = false;
                });
            }

            /**
             * Load list of patients assigned to the currently logged user (physician) whose last visit is still open
             */
            // promise object
            function loadPatientDay() {
                var patientData = [];
                var companyId = session.user.companyId;

                return $q.resolve()
                    .then(function () {
                        if (!scope.totalPatients || scope.datas.length < scope.totalPatients) {
                            // reset Spin
                            scope.spin = true;
                            // request list of patients
                            return dataServicePatients
                                .getPatientForPhysician({
                                    companyid: companyId,
                                    orderby: scope.orderby,
                                    sortorder: scope.sortorder
                                })
                                .then(function (json) {
                                    // Save number of patient
                                    var totalPatients = parseInt(json['nb_records']);
                                    scope.totalPatients = totalPatients;

                                    for (var i = 0; i < json.patients.length; i++) {
                                        patientData.push(json.patients[i]);
                                    }

                                    scope.datas = _.union(scope.datas, patientData);

                                    if (!_.isEmpty(scope.datas)) {
                                        _showEntries();
                                    }
                                })
                                .catch(function (exception) {
                                    return logger
                                        .sendReport(exception, exception.message)
                                        .then(function (index) {
                                            handleError(index, exception);
                                            return $q.reject(exception);
                                        });
                                })
                                .finally(function () {
                                    scope.hasData = (scope.datas && scope.datas.length > 0);
                                    scope.spin = false;
                                });
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

                scope.spin = false;
            }

            function calculatePatientAge(date) {
                var birthDate = moment(new Date(date));
                var now = moment();

                var years = now.diff(birthDate, 'years');

                return years;
            }

            function allEntriesVisible() {
                return _.every(scope.datas, _.iteratee('isVisible'));
            }

            function showLessEntries() {
                scope.nbrEntries = DEFAULT_ENTRIES_LIMIT;
                _showEntries();
            }

            function showMoreEntries() {
                scope.nbrEntries = scope.datas.length;
                _showEntries();
            }

            /**
             *
             * @private
             */
            function _showEntries() {
                if (scope.nbrEntries > scope.datas.length) {
                    scope.nbrEntries = scope.datas.length;
                }
                for (var i = scope.datas.length - 1; i >= 0; i--) {
                    scope.datas[i].isVisible = (i < scope.nbrEntries);
                }
                scope.nbrEntriesMore = scope.datas.length - scope.nbrEntries;
            }

            // set sorting state
            function setStateSorting(isSorting) {
                scope.isStateSorting = isSorting;
            }

            function isntExpandable() {
                return scope.warning || scope.error || !scope.hasData;
            }
        };
    }
})();
