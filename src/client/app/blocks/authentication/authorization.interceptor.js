/**
 * @ngdoc       property
 * @module      blocks.authentication
 * @name        authorizationInterceptor#TOKEN_TYPE
 * @description Prefix of the authorization's access token, at the moment `Bearer`.
 */
const TOKEN_TYPE = 'Bearer';
const LOGGER_COMPONENT_NAME = '[authorizationInterceptor]';


const config = ['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push('authorizationInterceptor');
    $httpProvider.interceptors.push('timeoutHttpInterceptor');
}];


authorizationInterceptor.$inject = ['$q', '$filter', 'logger', '$rootScope'];

/**
 * @ngdoc       service
 * @module      blocks.authentication
 * @name        authorizationInterceptor
 * @description
 *
 * Handles authorization by adding the Authorization header to all server requests.
 */
function authorizationInterceptor($q, $filter, logger, $rootScope) {
    var isRefreshingAuthorizationToken = false;
    var requestQueue = [];

    var service = {
        // Properties
        apiBaseUrl: undefined,
        isRefreshingToken: false,

        // Methods
        getAuthorizationToken: function() { return undefined; },
        refreshAuthorizationToken: function() { },
        request: onRequest,
        responseError: onResponseError
    };
    return service;


    // ---------------------------------------------------------------------- Interface methods

    /**
     * @ngdoc method
     * @name authorizationInterceptor#onRequest
     * @param {HTTP-Config} [config]     HTTP Request Config
     * @returns {HTTP-Config} [config]
     * @description
     *
     * Injects the authorization's access token into the http request config by adding the Authorization header.
     * If the authorization token is expired, the call get postponed in a queue until the token is refreshed.
     */
    function onRequest(config) {

        // Allow all non-api-calls (*.html, *.css, *.js) and anonymous api-calls marked to pass
        if (!_isApiCall(config.url) || config.isAnonymous === true) { return config; }

        var authorizationToken = service.getAuthorizationToken();
        var isAuthorizationTokenValid = _.isObject(authorizationToken) && authorizationToken.isValid();

        if (!isRefreshingAuthorizationToken) {
            // Should have valid token -> authorize the call and send it
            if (isAuthorizationTokenValid) {
                _setAuthorizationToken(config, authorizationToken);
                return config;
            }

            // Don't have a valid token -> ask for refreshing the authorization token;
            // Current call gets postponed (queued)
            if (!isAuthorizationTokenValid) {
                pauseAuthorizedCalls();
                service
                    .refreshAuthorizationToken()
                    .then(function() {
                        logger.log(LOGGER_COMPONENT_NAME, 'Authorization token successfully refreshed.');
                        resumeAuthorizedCalls();
                    })
                    .catch(function() {
                        logger.log(LOGGER_COMPONENT_NAME, 'Refreshing authorization token failed.');
                        cancelAuthorizedCalls();
                    });
            }
        }

        // Authorization token is being refreshed -> enqueue calls
        var deferred = $q.defer();
        requestQueue.push({
            deferred: deferred,
            config: config
        });
        return deferred.promise;
    }

    /**
     * @ngdoc method
     * @name authorizationInterceptor#onResponseError
     * @param {HTTP-Response} [response]     HTTP Response
     * @returns {HTTP-Response} [Potentially modified response]
     * @description
     *
     * Logs the 401 (HTTP forbidden) error and rejects the server call.
     */
    function onResponseError(response) {
        if (response && response.status === 401) {
            $rootScope.$broadcast('$redirectToLogin');
        }

        return $q.reject(response);
    }

    // ----------------------------------------------------------------- Token refresh handling

    function pauseAuthorizedCalls() {
        isRefreshingAuthorizationToken = true;
        logger.log(LOGGER_COMPONENT_NAME, 'Refreshing authorization token.');
    }

    function resumeAuthorizedCalls() {
        try {
            // Check new token
            var authToken = service.getAuthorizationToken();
            if (_.isObject(authToken) && authToken.isValid()) {
                // Resume all queued calls
                var length = requestQueue.length;
                _.each(requestQueue, function(requestQueueEntry) {
                    // Drop current token
                    delete requestQueueEntry.config.headers.Authorization;

                    // Update config with new token
                    _setAuthorizationToken(requestQueueEntry.config, authToken);

                    // Resolve promise
                    requestQueueEntry.deferred.resolve(requestQueueEntry.config);
                });
                requestQueue.splice(0, length);
            }

            // Cancel remaining calls (they have been resumed, but failed anyway)
            if (requestQueue.length > 0) { cancelAuthorizedCalls(); }
        }
        finally {
            isRefreshingAuthorizationToken = false;
        }
    }

    function cancelAuthorizedCalls() {
        try {
            // Cancel all queued calls
            _.each(requestQueue, function(requestQueueEntry) {
                requestQueueEntry.deferred.reject(requestQueueEntry.config);
            });
            requestQueue.splice(0, requestQueue.length);
        }
        finally {
            isRefreshingAuthorizationToken = false;
        }
    }

    // ------------------------------------------------------------------------- Helper methods

    function _isApiCall(url) {
        return _.isString(url) && (url.length > 0) && _isUrlInApiBaseSet(service.apiBaseUrls, url);
    }

    // verify if 'url' in list of url's (MW Applications - base url's)
    function _isUrlInApiBaseSet(apiBaseSet, url) {
        return _.findIndex(apiBaseSet, function(apiBaseUrl) {
            return url.indexOf(apiBaseUrl) === 0;  // find first apiBaseUrl that matches
        }) >= 0; // return if element was found
    }

    function _setAuthorizationToken(config, authToken) {
        if (_.isObject(authToken) && authToken.isValid()) {
            config.headers.Authorization = TOKEN_TYPE + ' ' + authToken.accessToken;
        }
        else {
            delete config.headers.Authorization;
        }
    }
}

export {
    authorizationInterceptor,
    config
};
