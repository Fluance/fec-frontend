/*jshint -W014*/ // Bad line breaking before '&&'
/*jshint -W101*/ // Line too long

authenticationService.$inject = [
    '$q',
    'authorizationInterceptor',
    'config',
    'dataservice.authentication',
    'dataservice.jwt',
    'Event'
];

/**
 * @ngdoc       service
 * @module      blocks.authentication
 * @name        authenticationService
 * @requires    authorizationInterceptor
 * @requires    module:config.config
 * @requires    module:app.core.dataService.jwt
 * @description
 *
 * The authentication service is responsible for requesting and releasing authorization tokens provided by the server.
 * It also holds a copy of the authorization token in-memory as well as in the session cache.
 *
 * <a class="waves-effect blue waves-light btn" href="https://confluence.fluance.net:8090/display/FT/concept.Authentication" target="_blank"><fec-icon type="description"></fec-icon> concept</a>
 */
function authenticationService($q, authorizationInterceptor, config, dataserviceAuthentication, dataserviceJwt, Event) {

    // In-memory authorization token (for performance reasons)
    var authToken;

    // Initialize authorizationInterceptor
    authorizationInterceptor.apiBaseUrls = config.apiBaseSet;
    authorizationInterceptor.getAuthorizationToken = function() { return authToken; };
    authorizationInterceptor.refreshAuthorizationToken = function() { return refreshAuthorizationToken(); };

    var service = {
        // Methods
        getJwt: getJwt,
        getServiceProviders: getServiceProviders,
        clearAuthorizationToken: clearAuthorizationToken,
        getAuthorizationToken: getAuthorizationToken,
        isAuthenticated: isAuthenticated,

        // Events
        authenticationChanged: new Event()
    };
    return service;

    // --------------------------------------------------------------- Interface implementation

    /**
     * @ngdoc method
     * @name authenticationService#getJwt
     * @param   {Object}    issuer      The isser that should be in the payload of the json web token.
     * @description
     *
     * Requests a new json web token from the server having the specified issuer in the payload.
     */
    function getJwt(issuer) {
        return dataserviceJwt.getJwt(issuer);
    }

    /**
     * @ngdoc method
     * @name authenticationService#getServiceProviders
     * @param {String}      redirectUrl The url to redirect to after an authorization token has been issued by the identity provider.
     * @return {Promise}                Returns a promise that resolves with a list of authentication providers.
     * @description                     Requests the list of possivle authentication providers through whom a user can request access to the application.
     */
    function getServiceProviders(redirectUrl) {
        return dataserviceAuthentication.getServiceProviders(redirectUrl);
    }

    /**
     * @ngdoc method
     * @name authenticationService#isAuthenticated
     * @return {boolean}                True if there is an authorization token and the token has not expired yet.
     * @description                     Gets the value indicating whether the authorization token is valid (not expired).
     */
    function isAuthenticated() {
        return _.isObject(authToken) && authToken.isValid();
    }

    /**
     * @ngdoc method
     * @name authenticationService#clearAuthorizationToken
     * @param   {Object}    authToken   The authorization token to release.
     * @description
     *
     * Removes the authorization token from the session cache and invalidates it on the server.
     * Once the token has been released on the server, the application redirects to the specified url.
     */
    function clearAuthorizationToken(redirectUrl, noSessionTimeout) {
        return $q.resolve()
            .then(function() {
                if (authToken && !authToken.isValid()) {
                    return refreshAuthorizationToken(noSessionTimeout);
                }
            })
            .then(function() {
                // Clear token in session cache
                return dataserviceAuthentication.clearAuthorizationToken();
            })
            .then(function() {
                // Invalidate token on the server
                var url;
                if (_.isObject(authToken)) {
                    url =
                        config.apiAuth +
                        '/logout/initialize?' +
                        'accessToken=' + authToken.accessToken + '&' +
                        'redirectUrl=' + encodeURIComponent(redirectUrl);
                } else {
                    // Invalidate without an authToken -> navigate to root
                    url = redirectUrl;
                }

                if (_.isString(url) && url.length > 0) {
                    window.location.replace(url);
                }
            });
    }

    /**
     * @ngdoc method
     * @name authenticationService#getAuthorizationToken
     * @param   {Object}    jsonWebToken    A json web token (usualy provided as query parameter in the url)
     *                                      that will be sent to the server.
     * @description
     *
     * Gets an authorization token verifying if it is valid.
     */
    function getAuthorizationToken(jsonWebToken) {
        return dataserviceAuthentication.getAuthorizationToken(jsonWebToken)
            .then(function(token) {
                if (_.isObject(token) && token.isValid()) {
                    // Update in-memory token
                    authToken = token;
                } else {
                    // No token or no longer valid
                    authToken = undefined;
                    return dataserviceAuthentication.clearAuthorizationToken();
                }
            })
            .finally(function() {
                var isAuthenticated = _.isObject(authToken);

                // Notify
                service.authenticationChanged.raise({ isAuthenticated: isAuthenticated });

                return (isAuthenticated) ? $q.resolve() : $q.reject();
            });
    }

    /**
     * @ngdoc method
     * @name authenticationService#refreshAuthorizationToken
     * @description
     *
     * Refreshes the current authorization token using its refresh token.
     * During the refresh, all requests will be held back until the new token is available.
     */
    function refreshAuthorizationToken(noSessionTimeout) {
        return $q.resolve()
            .then(function() {
                return (_.isObject(authToken)) ? dataserviceAuthentication.refreshAuthorizationToken(authToken) : $q.reject();
            })
            .then(function(token) {
                // Update in-memory token
                authToken = token;
            })
            .catch(function(error) {
                // Clear in-memory token
                authToken = undefined;

                if (noSessionTimeout) {
                    return $q.resolve();
                } else {
                    // Clear token in session cache
                    return dataserviceAuthentication
                        .clearAuthorizationToken()
                        .then(function() {
                            // Notify
                            service.authenticationChanged.raise({ isAuthenticated: false });

                            return $q.reject();
                        });
                }
            });
    }
}

export default authenticationService;
