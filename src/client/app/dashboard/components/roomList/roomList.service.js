(function () {
    'use strict';

    var componentName = 'RoomListComponent';
    angular
        .module('app.dashboard')
        .service(componentName, RoomListComponent);

    RoomListComponent.$inject = [
        '$mdMedia',
        '$rootScope',
        'dataservice.patients',
        'dataservice.rooms',
        'dataservice.hospServices',
        'dataservice.units',
        'logger',
        'sessionService',
        'userAgentService'
    ];

    /**
     * @ngdoc service
     * @module dashboard
     * @name MyUnitComponent
     * @description
     *
     * This is a dashboard object. Allow you to create an object.
     *
     */
    function RoomListComponent(
        $mdMedia,
        $rootScope,
        dataServicePatients,
        dataServiceRooms,
        dataServiceHospServices,
        dataServiceUnits,
        logger,
        session,
        userAgent
    ) {
        return function (params) {
            // Scope connect controller and template
            var scope = {
                // Properties
                className: undefined,
                title: undefined,
                titleChange: undefined,
                errorNoRoom: undefined,
                errorNoEntries: undefined,
                tutorialChapterName: componentName + '_for_' + params.by,
                loadAmb: false,
                ambDefaultSelect: null,
                showSettings: false,

                // Parameters
                // clone param's defined in component scope (eg: adding 'code' in params).
                // => Component 'params' used by dashboard to compare components (eg: component name + params)
                params: angular.extend(params, {}),

                // Filters
                selectionReveal: {
                    items: [],
                    selectedItem: undefined,
                    selectedItemChanged: onSelectedItemChanged,
                    getItemDisplayName: function (item, includeNumberOfPatients, isDialog) {
                        var displayName = item.code;
                        if (item.codeDesc && !(userAgent.isMobileSize() && !isDialog)) {
                            displayName += ' - ' + item.codeDesc;
                        }
                        if (includeNumberOfPatients) {
                            displayName += ' (' + item.nbPatients + ')';
                        }
                        return displayName;
                    }
                },

                // Error and UI handling
                error: null, // contain error message as String
                warning: null, // contain warning message as String
                logger: logger, // Logger object to access report on 'See report' button
                isLoading: false, // enable/disable preloader animation
                hasUnitOrService: false, //hide the component if there is not unit or services for the current company

                // Methods
                changeTab: changeTab,
                isMobile: userAgent.isMobileSize,
                toggleSettings: toggleSettings,

                onSelectedCompanyChanged: onSelectedCompanyChanged,
                onUserDataChanged: onUserDataChanged,
                onUserProfileChanged: onUserProfileChanged
            };

            return {
                // SOME DATA, NOT REQUIRED
                name: componentName,
                params: params,
                scope: scope,
                states: {
                    'default': {
                        template: 'app/dashboard/components/roomList/roomList.tpl.html',
                        controller: function() {
                            // Initialize
                            initScopeParams();
                            initFilter();

                            _refreshBody();
                        },
                        refreshStateSorting: function (isSorting) {
                            // set isStateSorting in scope (to display draggable layer)
                            if (!_.isUndefined(isSorting) && _.isBoolean(isSorting)) {
                                setStateSorting(isSorting);
                            }
                        }
                    },
                    'extended': {
                        template: 'app/dashboard/components/roomList/roomList.tpl.extended.html'
                    }
                }
            };



            // --------------------------------------------------------------------- Initialisation
            function onSelectedCompanyChanged() {
                scope.params.code = undefined;
                initFilter();
                _refreshBody();
            }

            function onUserDataChanged() {
                _updateUserSession();
            }

            function onUserProfileChanged() {
                _refreshBody();
            }

            /**
             * Validate the current selected tab and if is necessary change the tab
             * @private
             */
            function _chooseSelectedTab() {
                scope.hasData = (scope.hospCount || scope.ambCount) ? true : false;
                if (!_.isEmpty(scope.selectedTab)) {
                    switch (scope.selectedTab) {
                        case 'hosp-tab':
                            if (scope.hasData && !scope.hospCount) {
                                changeTab('amb-tab');
                            }
                            break;
                        case 'amb-tab':
                            if (scope.hasData && !scope.ambCount) {
                                changeTab('hosp-tab');
                            }
                            break;
                    }
                } else {
                    if (scope.hasData && scope.hospCount) {
                        changeTab('hosp-tab');
                    } else if (scope.hasData && scope.ambCount) {
                        changeTab('amb-tab');
                    } else {
                        changeTab('hosp-tab');
                    }
                }
            }

            // --------------------------------------------------------------- Interface operations

            /**
             * Change to parameter tab
             * @param selectedTab
             */
            function changeTab(selectedTab) {
                switch (selectedTab) {
                    case 'hosp-tab':
                        scope.showHospTab = true;
                        scope.showAmbTab = false;
                        scope.selectedTab = 'hosp-tab';
                        break;

                    case 'amb-tab':
                        scope.showHospTab = false;
                        scope.showAmbTab = true;
                        scope.selectedTab = 'amb-tab';
                        break;
                }
            }

            function toggleSettings() {
                scope.showSettings = !scope.showSettings;
            }

            /**
             * Initialize scope parameters
             */
            function initScopeParams() {
                switch (params.by) {
                    case 'services':
                        scope.className = 'byServiceRoomList';
                        scope.title = 'dashboard.MY_SERVICE_TITLE';
                        scope.titleChange = 'dashboard.CHANGE_SERVICE_TITLE';
                        scope.errorNoRoom = 'dashboard.MY_SERVICE_NO_ROOM';
                        scope.errorNoEntries = 'dashboard.MY_SERVICE_NO_UNITS';
                        scope.patientList = false;
                        scope.whiteboardAvailable = true;
                        break;

                    case 'units':
                        scope.className = 'byUnitRoomList';
                        scope.title = 'dashboard.MY_UNIT_TITLE';
                        scope.titleChange = 'dashboard.CHANGE_UNIT_TITLE';
                        scope.errorNoRoom = 'dashboard.MY_UNIT_NO_ROOM';
                        scope.errorNoEntries = 'dashboard.MY_UNIT_NO_UNITS';
                        scope.patientList = true;
                        scope.whiteboardAvailable = false;
                        break;

                    default:
                        throw new Error('missing parameter on RoomListComponent initialisation');
                }
            }

            /**
             * Refresh body section of component
             * @private
             */
            function _refreshBody() {
                if(scope.error === null) {
                    initTabs();
                }
            }

            /**
             * Initialize filter values (list of units/services)
             * @param code code of the unit/service to be selected. If no value, then the preferred unit/service or the first element is selected
             */
            function initFilter(code) {
                // Reset selected filter
                scope.selectionReveal.selectedItem = undefined;
                scope.selectedCompanyId = session.user.companyId;

                scope.hasUnitOrService = false;

                // Initialize filter
                switch (scope.params.by) {
                    case 'services':
                        var hospServices = session.getSelectedCompanyHospServices();

                        if (!_.isNil(hospServices) && hospServices.length > 0) {
                            scope.hasUnitOrService = true;
                            scope.error = null;

                            scope.selectionReveal.items = _loadNbPatients(hospServices, false);
                            if (!_.isNil(code)) {
                                scope.selectionReveal.selectedItem = _.find(hospServices, {code: code});
                            }
                            if (_.isNil(scope.selectionReveal.selectedItem)) {
                                var service = session.getPreferredService(hospServices);
                                if (!_.isNil(service)) {
                                    scope.selectionReveal.selectedItem = _.find(hospServices, {code: service.code});
                                } else {
                                    scope.selectionReveal.selectedItem = hospServices[0];
                                }
                            }
                        } else {
                            scope.hasUnitOrService = false;
                            scope.error = {
                                'message': scope.errorNoEntries
                            };
                        }
                        break;

                    case 'units':
                        var units = session.getSelectedCompanyUnits();

                        if (!_.isNil(units) && units.length > 0) {
                            scope.hasUnitOrService = true;
                            scope.error = null;

                            scope.selectionReveal.items = _loadNbPatients(units, true);
                            if (!_.isNil(code)) {
                                scope.selectionReveal.selectedItem = _.find(units, {code: code});
                            }
                            if (_.isNil(scope.selectionReveal.selectedItem)) {
                                var unit = session.getPreferredUnit(units);
                                if (!_.isNil(unit)) {
                                    scope.selectionReveal.selectedItem = _.find(units, {code: unit.code});
                                } else {
                                    scope.selectionReveal.selectedItem = units[0];
                                }
                            }
                        } else {
                            scope.hasUnitOrService = false;
                            scope.error = {
                                'message': scope.errorNoEntries
                            };
                        }
                        break;

                    default:
                        throw new Error('missing parameter on RoomListComponent initialisation');
                }

                // set scope value of selected unit/hospservice code
                if (!_.isEmpty(scope.selectionReveal) && !_.isEmpty(scope.selectionReveal.selectedItem)) {
                    scope.params.code = scope.selectionReveal.selectedItem.code;
                }
            }

            /**
             * Initialize tabs
             * Check patient count for In and Out Patients, choose which tab to select (eg: no In-Patients), and
             */
            function initTabs() {
                var companyId = session.user.companyId;
                var hospService = undefined;
                var unit = undefined;
                if (!_.isEmpty(scope.params)) {
                    switch (scope.params.by) {
                        case 'services':
                            hospService = scope.params.code;
                            break;
                        case 'units':
                            unit = scope.params.code;
                            break;
                    }
                }

                var options = {
                    companyid: companyId,
                    limit: 1,
                    patientunit: unit,
                    hospservice: hospService,
                    sortorder: 'asc'
                };

                // get In-Patients count
                options.patientclass = 'I';
                dataServicePatients
                    .getPatientByRoomList(options)
                    .then(function (result) {
                        scope.hospCount = result.nb_records;
                    })
                    .finally(function () {
                        // get Out-Patients count
                        options.patientclass = 'O';
                        dataServicePatients
                            .getPatientByRoomList(options)
                            .then(function (result) {
                                scope.ambCount = result.nb_records;
                            })
                            .finally(function () {
                                _chooseSelectedTab();
                                _updateUserSession();
                            });
                    });
            }

            // ------------------------------------------------------------------------  Filter

            /**
             * Change the current selected item
             * @param item
             */
            function onSelectedItemChanged(item) {
                scope.selectionReveal.selectedItem = item;
                scope.params.code = item.code;
                _refreshBody();
            }

            /**
             * Update user session with current unit/service
             * @private
             */
            function _updateUserSession() {
                let code = scope.params.code;
                let preferred;

                switch (scope.params.by) {
                    case 'services': {
                        let hospServices = session.getSelectedCompanyHospServices();

                        // defensive checking of user's hospital services
                        if (!hospServices) break;
                        if(hospServices.length === 0) break;

                        // update preferred unit if it's different
                        preferred = session.getPreferredService(hospServices);
                        if (!preferred) break;

                        if(code !== preferred.code) {
                            session.setPreferredService(code);
                            session.user.serviceId = code;
                        }

                        // send event
                        $rootScope.$broadcast(session.EVENT_SELECTED_SERVICE_CHANGED, code);
                        break;
                    }

                    case 'units': {
                        let units = session.getSelectedCompanyUnits();

                        // defensive checking of user's hospital services
                        if (!units) break;
                        if (units.length === 0) break;

                        // update preferred unit if it's different
                        preferred = session.getPreferredUnit(units);
                        if (!preferred) break;

                        if(code !== preferred.code) {
                            session.setPreferredUnit(code);
                            session.user.unitId = code;
                        }
                        // send event
                        $rootScope.$broadcast(session.EVENT_SELECTED_UNIT_CHANGED, code);
                        break;
                    }
                }
            }

            // --------------------------------------------------------------------------- Tutorial
            /**
             *
             * @param isSorting
             */
            function setStateSorting(isSorting) {
                scope.isStateSorting = isSorting;
            }

            /**
             *
             * @param list
             * @param isUnit
             * @returns {*}
             * @private
             */
            function _loadNbPatients(list, isUnit) {
                var codeList;
                var fnGetCountList;

                // get list of codes (units/services)
                codeList = _.map(list, 'code');

                if (isUnit) {
                    fnGetCountList = dataServiceUnits.getUnitListCount;
                } else {
                    fnGetCountList = dataServiceHospServices.getServiceListCount;
                }

                // get list of units/services + counts
                fnGetCountList(session.user.companyId, codeList)
                    .then(function(countList) {
                        // set nbPatients in list
                        _.each(list, function(item) {
                            item.id = item['code'];
                            var countItem = _.find(countList, {code: item['code']});
                            // if count is not found, it means it's 0.
                            if(_.isUndefined(countItem)) {
                                item['nbPatients'] = 0;
                            }
                            else {
                                item['nbPatients'] = countItem['nbPatients'];
                            }
                        })
                    });

                return list;
            }
        };
    }
})();
