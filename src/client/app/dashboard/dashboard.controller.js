// jscs:disable requireParenthesesAroundIIFE

DashboardController.$inject = [
    '$q',
    '$timeout',
    '$filter',
    '$scope',
    '$injector',
    '$element',
    'dashboardFactory',
    'fullSearchService',
    'config',
    'sessionService',
    '$ocLazyLoad',
    '$rootScope'
];

function DashboardController(
    $q,
    $timeout,
    $filter,
    $scope,
    $injector,
    $element,
    fluanceDashboard,
    fullSearchService,
    config,
    session,
    $ocLazyLoad,
    $rootScope
) {
    var vm = this;
    vm.title = 'Dashboard Controller';
    var tempDashboard = '';

    // Check dashboard configuration exists
    if(!config.dashboard || !config.dashboard.components) {
        console.error('Error: cannot initialize dashboard: no configuration');
        $element.remove();
        return;
    }

    $scope.dashboard = fluanceDashboard.get('cockpit');
    $scope.dashboard.components = [];
    $scope.dashboard.nbComponent = 0;
    activate();
    //if (tutorialService.isActive()) {
    //    // Configure tutorials
    //    configureTutorial();
    //}
    configureDashboard();

    function configureDashboard() {
        var newCockpit;

        if ($scope.dashboard.nbComponent === 0) {
            // create Dashboard components according to user profile
            createComponentList()
                .then(function(componentList) {
                    // user re-arranged the dashboard
                    if (!!session.user.cockpit) {
                        try {
                            newCockpit = $scope.dashboard.fromString(session.user.cockpit);
                        } catch (error) {
                            newCockpit = null;
                        }

                        // update Dashboard as String in preferences (with displayed/injected components only, or reset Cockpit)
                        if (_.isString(newCockpit) || _.isNull(newCockpit)) {
                            session.user.setUserData({
                                'cockpit': newCockpit
                            });
                        }
                    }

                    // add only new components to the Dashboard
                    componentList.forEach(function(component) {
                        var isDuplicate = false;
                        _.each($scope.dashboard.components, function (dashboardComponent) {
                            if (dashboardComponent.name && component.name && dashboardComponent.name === component.name) {
                                if (dashboardComponent.params && component.params && dashboardComponent.params.by && component.params.by && dashboardComponent.params.by === component.params.by) {
                                    isDuplicate = true;
                                }
                            }
                        });
                        if(!$scope.dashboard.hasComponent(component) && !isDuplicate) {
                            $scope.dashboard.add(component);
                        }
                    });

                    // refresh dashboard
                    $scope.dashboard.refresh();
                });
        } else {
            $scope.dashboard.disableExtended();
        }
    }

    function createComponentList() {
        var componentList = [];
        var deferred = $q.defer();
        var filesToLoad = [];

        if (session.user) {
            // Initialize the Dashboard dynamically (from configuration)
            _.each(config.dashboard.components, function(component) {
                // verify use role
                if (_.isUndefined(component.roles) || session.user.hasRole(component.roles)) {
                    filesToLoad.push(config.dashboard.componentsBase + component.path);
                }
            });

            // lazy load Dashboard components (services) from configuration
            $ocLazyLoad
            .load({files: filesToLoad})
            .then(function() {
                _.each(config.dashboard.components, function(component) {
                    // verify use role
                    if (_.isUndefined(component.roles) || session.user.hasRole(component.roles)) {
                        // verify component exists before adding to the Dashboard
                        if ($injector.has(component.name)) {
                            var componentService = $injector.get(component.name);
                            componentList.push(new componentService(component.params ? component.params : {}));
                        }
                    }
                });

                deferred.resolve(componentList);
            });
        }
        else {
            // empty component list
            deferred.resolve(componentList);
        }

        return deferred.promise;
    }

    function activate() {
        // we reset scrolllTopLimit to 1000 pixels.
        $scope.$on('$destroy', function() {
            config.scrollTopLimit = 1000;
        });
        //if (tutorialService.isActive()) {
        //    // Configure tutorials
        //    tutorialService.current(tutorialService.CHAPTER_NAME_MY_COCKPIT);
        //}
    }

    function configureTutorial() {
        var stepsToolbar1 = [{
            element: '[tutorial-step="menu"]',
            introKey: 'dashboard.GUIDE_NAVIGATION_BAR_SETTINGS',
            position: 'bottom-left-aligned'
        }, {
            element: '[tutorial-step="search"]',
            introKey: 'dashboard.GUIDE_NAVIGATION_BAR_SEARCH',
            position: 'bottom-left-aligned'
        }, {
            element: '[tutorial-step="dashboard"]',
            introKey: 'dashboard.GUIDE_NAVIGATION_BAR_HOMEPAGE',
            position: 'bottom-left-aligned'
        }];
        var stepsToolbar2 = [{
            element: '[tutorial-step="company-selection"]',
            introKey: 'dashboard.GUIDE_NAVIGATION_BAR_CHANGE_SITE',
            position: 'bottom-right-aligned'
        }];
        var stepsDashboardComponents = [{
            element: '.byUnitRoomList',
            introKey: 'dashboard.GUIDE_MY_UNIT_TITLE',
            position: 'auto',
            isValid: function() {
                return session.user && session.user.hasRole(['sysadmin', 'physician', 'nurse']);
            }
        }, {
            element: '.byServiceRoomList',
            introKey: 'dashboard.GUIDE_MY_SERVICE_TITLE',
            position: 'auto',
            isValid: function() {
                return session.user && session.user.hasRole(['sysadmin', 'physician', 'nurse']);
            }
        }, {
            element: '.myPatients',
            introKey: 'dashboard.GUIDE_MY_PATIENTS_TITLE',
            position: 'auto',
            isValid: function() {
                return session.user && session.user.hasRole(['sysadmin', 'physician']);
            }
        }, {
            element: '.byLocationAppointments',
            introKey: 'dashboard.GUIDE_PATIENT_APPOINTMENTS_TITLE',
            position: 'auto',
            isValid: function() {
                return session.user && session.user.hasRole(['sysadmin', 'nurse']);
            }
        }, {
            element: '.byUserAppointments',
            introKey: 'dashboard.GUIDE_NAVIGATION_MY_AGENDA',
            position: 'auto',
            isValid: function() {
                return session.user && session.user.hasRole(['sysadmin', 'physician']);
            }
        }, {
            element: '.myLastSearch',
            introKey: 'dashboard.GUIDE_LAST_SEARCHS',
            position: 'auto'
        }, {
            element: '.reorganize',
            introKey: 'dashboard.GUIDE_EDIT_LAYOUT',
            position: 'top-middle-aligned'
        }];
        var stepsSearch = fullSearchService.getTutorialStepFullSearchInput();

        var allSteps = [].concat(stepsToolbar1, stepsSearch, stepsToolbar2, stepsDashboardComponents);

        // Register tutorial
        //tutorialService.setSteps(tutorialService.CHAPTER_NAME_MY_COCKPIT, 0, allSteps, ['bottom-middle-aligned', 'top-middle-aligned']);
    }

    /**
     * Triggerd on reorganize button
     */
    $scope.toggleSortable = function(saveCockpit) {

        $scope.dashboard.toggleSortable();

        if (!$scope.dashboard.isStateSorting) {
            if (saveCockpit) {
                // Stop sorting
                if (session.user) {
                    session.user.setUserData({
                        'cockpit': $scope.dashboard.toString()
                    });
                }
            } else {
                $scope.dashboard.components = [];
                $scope.dashboard.nbComponent = 0;
                $scope.dashboard.fromString(tempDashboard);
                $scope.dashboard.refresh();
            }
        } else {
            tempDashboard = $scope.dashboard.toString();
        }
    };
}

export default DashboardController;
