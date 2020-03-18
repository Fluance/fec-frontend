import template from './sidenav.menu.component.html';

const SidenavMenu = {
    controller: [
        '$rootScope',
        '$mdSidenav',
        '$state',
        'config',
        'sessionService',
        'LogoutDialogService',
        'MultiSessionService',
        //'tutorialService',
        'waitForRendering',
        '$q',
        '$filter',
        controller
    ],
    controllerAs: 'vm',
    templateUrl: template
};

function controller($rootScope, $mdSidenav, $state, config, session, logoutDialogService, multiSessionService, waitForRendering, $q, $filter) {
    var onAuthenticationChangedEventHandler, onLogoutOtherSessionsEventHandler;

    /*jshint validthis: true */
    var vm = this;
    var currentLanguage;

    // Properties
    vm.applicationTitle = config.title;
    //vm.tutorialChapterName = tutorialService.CHAPTER_NAME_SIDEBAR_MENU;
    vm.languages = ['de', 'en', 'fr', 'it'];
    vm.selectedLanguage = undefined;
    vm.navigationRoutes = [];
    vm.userNavigationRoutes = [];
    vm.hasUserSessions = false;
    vm.userSessionsCount = 0;
    vm.baseURL = config.baseURL;

    // Methods
    vm.isAuthenticated = function() { return session.isAuthenticated(); };
    vm.logout = logout;
    vm.onLogout = onLogout;
    vm.selectedLanguageChanged = selectedLanguageChanged;

    // Events
    vm.$onInit = onInit;
    vm.$onDestroy = onDestroy;
    return vm;

    // ------------------------------------------------------------------------- Initialization

    function onInit() {
        if (!_.isUndefined(config.version) && !_.isUndefined(config.version.major) && !_.isUndefined(config.version.minor) && !_.isUndefined(config.version.dot)) {
            vm.appVersion = 'FEC V '+config.version.major +'.'+config.version.minor +'.'+config.version.dot
        }
        // Set language selection to current UI language
        vm.selectedLanguage = session.getUILanguage();

        // Menu items
        _getNavigationRoutes();
        _getUserNavigationRoutes();
        //if (tutorialService.isActive()) {
        //    // Configure tutorials
        //    _configureTutorial();
        //}

        // Register Events
        onAuthenticationChangedEventHandler = $rootScope.$on(session.EVENT_AUTHENTICATION_CHANGED, onAuthenticationChanged);
        onLogoutOtherSessionsEventHandler = $rootScope.$on(logoutDialogService.EVENT_LOGOUT_OTHER_SESSIONS, _onLogoutOtherSessions);
    }

    function onDestroy() {
        onAuthenticationChangedEventHandler();
        onLogoutOtherSessionsEventHandler();
    }

    // ------------------------------------------------------------------------- Event handlers

    function onAuthenticationChanged(event, args) {
        // Set language selection to current UI language
        vm.selectedLanguage = session.getUILanguage();

        // Update menu items
        _getNavigationRoutes();
        _getUserNavigationRoutes();
        _getUserSessions();
    }

    function _onLogoutOtherSessions(event, args) {
        waitForRendering.wait(function () {
            _getUserSessions();
        });
    }

    // --------------------------------------------------------------- Interface implementation

    function logout() {
        session.logout();
    }

    function selectedLanguageChanged() {
        if (currentLanguage && vm.selectedLanguage === currentLanguage) {
            return;
        } else {
            currentLanguage = vm.selectedLanguage;
        }

        $mdSidenav('menu').close();
        session.setUILanguage(vm.selectedLanguage);
    }

    function onLogout($event) {
        if (multiSessionService.isActive() && vm.hasUserSessions && multiSessionService.isSessionRevocationEnable()) {
            $q.all(
                [multiSessionService.getDeviceSessionsCount()]
            ).then(function (data) {
                if (data && data[0] && data[0].count > 1) {
                    _openLogoutDialog($event);
                } else {
                    logout();
                }
            });
        } else {
            logout();
        }
    }

    // ------------------------------------------------------------------------------- Tutorial

    /*
    function _configureTutorial() {
        tutorialService.setSteps(tutorialService.CHAPTER_NAME_SIDEBAR_MENU, 0, [{
            element: '[tutorial-step="settings"]',
            introKey: 'layout.GUIDE_MENU_USER',
            position: 'bottom',
            isValid: function() {
                return session.isAuthenticated();
            }
        }, {
            element: '[tutorial-step="mycockpit"]',
            introKey: 'layout.GUIDE_MENU_COCKPIT',
            position: 'bottom',
            isValid: function() {
                return session.isAuthenticated();
            }
        }, {
            element: '[tutorial-step="admin-users"]',
            introKey: 'layout.GUIDE_MENU_ADMIN',
            position: 'bottom',
            isValid: function() {
                return session.isAuthenticated() && session.user && session.user.hasRole(['sysadmin']);
            }
        }, {
            element: '[tutorial-step="language"]',
            introKey: 'layout.GUIDE_MENU_LANGUAGE',
            position: 'bottom'
        }, {
            element: '[tutorial-step="contact-center"]',
            introKey: 'layout.FEEDBACK_CONTACT_US',
            position: 'top'
        }]);
    }
    */

    // ------------------------------------------------------------------------- Helper methods

    function _getNavigationRoutes() {
        var routes = [];
        var states = $state.get();
        _.each(states, function(state) {
            // Consider only states with navigation meta info
            if (_.isUndefined(state.settings) || _.isUndefined(state.settings.nav)) { return; }

            // Check access control / authentication
            if (!state.accessControl.allowAnonymous && !session.isAuthenticated()) { return; }

            // Check access control / roles
            if (session.user && (state.accessControl.restrictToRoles.length > 0)) {
                if (!session.user.hasRole(state.accessControl.restrictToRoles)) { return; }
            }

            // Checks passed -> add to list
            routes.push({
                cssTutorial: state.name.replace('.', '-'),
                icon: state.settings.content,
                order: state.settings.nav,
                title: 'layout.' + state.settings.i18n,
                url: state.name,
            });

        });

        vm.navigationRoutes = _.sortBy(routes, 'order');
    }

    function _getUserNavigationRoutes() {
        // Get current user
        var userDisplayName = (session.user) ? $filter('avoidNullText')(session.user.firstName) + ' ' + $filter('avoidNullText')(session.user.lastName) : '-';
        var userName = (session.user) ? $filter('avoidNullText')(session.user.username) + ' / ' + $filter('avoidNullText')(session.user.domain) : '-';

        var routes = [];

        // Settings
        var stateSettings = $state.get('settings');
        if (stateSettings && session.isAuthenticated()) {
            routes.push({
                cssTutorial: stateSettings.name.replace('.', '-'),
                icon: stateSettings.settings.content,
                order: stateSettings.settings.nav,
                title: userDisplayName,
                subtitle: userName,
                url: stateSettings.name,
            });
        }

        vm.userNavigationRoutes = _.sortBy(routes, 'order');
    }

    function _getUserSessions() {
        if(multiSessionService.isActive() && session.isAuthenticated()) {
            multiSessionService.getDeviceSessionsCount()
                .then(function (sessionsCount) {
                    vm.userSessionsCount = sessionsCount.count;
                    vm.hasUserSessions = sessionsCount.count > 0;
                });
        }
    }

    function _openLogoutDialog($event) {
        logoutDialogService.openLogoutDialog($event);
    }
}

export default SidenavMenu;
