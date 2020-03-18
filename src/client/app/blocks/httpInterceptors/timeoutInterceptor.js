const MAX_RETRIES = 3;

const config = ['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push('timeoutInterceptor');
}];

timeoutInterceptor.$inject = ['$injector', '$q', 'logger'];

/**
 * @ngdoc       service
 * @module      app
 * @name        timeoutInterceptor
 * @requires    logger
 * @description
 *
 * Handles time-outs for any http request.
 * It keeps track of the $http configs and tries to re-submit them until MAX_RETRIES is reached.
 *
 */
function timeoutInterceptor($injector, $q, logger) {
    var requestCache = {};

    return {
        request: onRequest,
        response: onResponse,
        responseError: onResponseError
    };


    // ---------------------------------------------------------------------- Interface methods

    /**
     * @ngdoc method
     * @name timeoutInterceptor#onRequest
     * @param {HTTP-Config}     The config of the currently executing $http call.
     * @returns {HTTP-Config}   The config of the currently executing $http call.
     * @description
     *
     * Tracks the config of the currently executing $http call.
     * This allows to re-submit the call, in case it times out.
     */
    function onRequest(config) {
        // Tag request for identification
        if (!config.requestId) {
            config.requestId = moment().valueOf();
        }

        // Cache request for potential re-try
        var entry = getRequestConfigEntry(config);
        if (!entry) {
            cacheRequestConfig(config);
        }

        return config;
    }

    /**
     * @ngdoc method
     * @name timeoutInterceptor#onResponse
     * @param {HTTP-Response}   The response of the successfully completed $http call.
     * @returns {HTTP-Response} The response of the successfully completed $http call.
     * @description
     *
     * Releases the tracked config of the completed $http call.
     */
    function onResponse(response) {
        // Release completed request
        releaseRequestConfig(response.config);
        return response;
    }

    /**
     * @ngdoc method
     * @name timeoutInterceptor#onResponseError
     * @param {HTTP-Response} [response]     HTTP Response
     * @returns {HTTP-Response} [Potentially modified response]
     * @description
     *
     * Catches timed-out requests and tries to re-submit them again until MAX_RETRIES has been reached.
     */
    function onResponseError(response) {
        if (response && response.status && response.xhrStatus &&
            (response.status !== 401 && response.status !== 403) &&
            response.xhrStatus === 'timeout') {
            if (canRetry(response.config)) {
                console.warn('Timeout on', response.config.url, 'Re-trying...');

                var $http = $injector.get('$http');
                return $http(response.config);
            }
            else {
                // Release abandoned request
                releaseRequestConfig(response.config);
                console.error('Timeout on', response.config.url, 'Have given up!');
                response.message = 'error.HTTP_REQUEST_TIME_OUT';

                // ToDo: Log failed request to Graylog
            }
        }

        return $q.reject(response);
    }


    // ------------------------------------------------------------------------- Helper methods

    function canRetry(config) {
        var entry = getRequestConfigEntry(config);

        if (entry) {
            if (entry.count <= MAX_RETRIES) {
                // Increment count and re-try
                entry.count++;
                return true;
            }
            else {
                // Re-try quota exceeded
                return false;
            }
        }
        else {
            return true;
        }
    }


    // ------------------------------------------------------------------------- Cache handling

    function getRequestConfigEntry(config) {
        return (config.requestId) ? requestCache[config.requestId] : undefined;
    }

    function cacheRequestConfig(config) {
        requestCache[config.requestId] = {
            config: config,
            count: 1
        };
    }

    function releaseRequestConfig(config) {
        if (config.requestId) {
            delete requestCache[config.requestId];
        }
    }
}

export {
    timeoutInterceptor,
    config
}


