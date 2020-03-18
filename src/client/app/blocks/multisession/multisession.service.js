MultiSessionService.$inject = ['authenticationService', 'multisession.dataservice', 'dataservice.session', 'sessionService', '$q'];

function MultiSessionService(auth, multisession, sessionService, session, $q) {
    var _config,
        _isActive;
    var service = {
        init: init,
        isActive: isActive,
        isDeviceLogoutEnabled: isDeviceLogoutEnabled,
        isSessionRevocationEnable: isSessionRevocationEnable,

        logoutDevice: logoutDevice,
        logoutDevices: logoutDevices,
        getDeviceSessions: getDeviceSessions,
        getDeviceSessionsCount: getDeviceSessionsCount
    };

    return service;

    // -----------------------------------------------

    function init(config) {
        if (!_.isObject(config)) { return; }

        _config = config;
        service.isActive(true);
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

    function isSessionRevocationEnable() {
        return (_config.showForSharedUsers || _.isUndefined(session.user) || _.isUndefined(session.user.usertype) || session.user.usertype !== 'shared');
    }

    function isDeviceLogoutEnabled() {
        return !_.isUndefined(session.user) && !_.isUndefined(session.user.usertype) && session.user.usertype !== 'shared';
    }


    /**
     * @ngdoc method
     * @name sessionService#logoutDevice
     * @param token
     * @returns {Promise}
     * @description
     *
     * Logs out an active session of the current user in another device
     */
    function logoutDevice(token) {
        return multisession.logoutSession(token);
    }


    /**
     * @ngdoc method
     * @name sessionService#logoutDevices
     * @param tokenList
     * @returns {Promise}
     * @description
     *
     * Logs out an active session of the current user in another device
     */
    function logoutDevices(tokenList) {
        var loggedOutDevices = [];
        _.each(tokenList, function (token) {
            loggedOutDevices.push(logoutDevice(token));
        });
        return $q.all(loggedOutDevices);
    }

    function getDeviceSessions() {
        return sessionService.getAuthorizationToken().then(function (authToken) {
            return multisession.getUserSessions(authToken.accessToken);
        });
    }

    function getDeviceSessionsCount() {
        return sessionService.getAuthorizationToken().then(function (authToken) {
            return multisession.getUserSessionsCount(authToken.accessToken);
        });
    }

}


export default MultiSessionService;
