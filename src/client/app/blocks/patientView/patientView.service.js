PatientViewService.$inject = ['$rootScope', 'sessionService', 'Event'];

function PatientViewService($rootScope, session, Event) {
    var _config,
        _isActive,
        _isEnabled;

    var service = {
        init: init,
        isActive: isActive,
        isEnabled: isEnabled,
        isNavigationDisabled: isNavigationDisabled,

        // Events
        navigationDisabled: new Event()
    };

    return service;

    // -------------------------------------------------------- Interface methods

    function init(config) {
        if (!_.isObject(config)) {
            service.isActive(false);
            service.isEnabled(false);
            return;
        }

        _config = config;
        service.isActive(true);

        // listen to event: 'authentication changed'
        $rootScope.$on(session.EVENT_AUTHENTICATION_CHANGED, _onAuthenticationChanged);
    }

    function isActive(value) {
        if (_.isUndefined(value)) {
            return _isActive;
        }
        else {
            var oldValue = _isActive;
            _isActive = value;
            return oldValue;
        }
    }

    function isEnabled(value) {
        if (_.isUndefined(value)) {
            return _isEnabled;
        }
        else {
            var oldValue = _isEnabled;
            _isEnabled = value;
            return oldValue;
        }
    }

    function isNavigationDisabled() {
        return _isActive && _isEnabled && _config.disableNavigation;
    }

    // -------------------------------------------------------- Event handling

    /**
     * Handle event when user authentication is changed (eg: on login)
     * @param event
     * @param params object: {isAuthenticated: Boolean, reason: String, user: <User>}
     * @private
     */
    function _onAuthenticationChanged(event, params) {
        var USER_TYPE_NAV_DISABLED = 'nav_disabled';

        // Check user type: NAV_DISABLED? (eg: a 'Celsius37' user)
        if(params.user && params.user.usertype === USER_TYPE_NAV_DISABLED) {
            // enable service
            service.isEnabled(true);

            // fire notification event(s)
            service.navigationDisabled.raise(_config.disableNavigation);
        }
        else {
            // disable service
            service.isEnabled(false);

            // fire notification event(s)
            service.navigationDisabled.raise(false);
        }
    }
}


export default PatientViewService;
