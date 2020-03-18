import _ from 'lodash';

// Constants
const SESSION_CACHE_AUTHORIZATION_TOKEN = 'fec-authorization-token';
const SESSION_CACHE_NAVIGATION_BACK_CONTEXT = 'fec-navigation-back-context';

dataServiceSession.$inject = ['$q', '$window', 'localStorageService'];

/**
 * @ngdoc       service
 * @module      app
 * @name        dataservice.session
 * @description
 *
 * Handles session state as well as session cache handling for the application.
 */
function dataServiceSession($q, $window, localStorageService) {

    var service = {
        // Authorization token
        clearAuthorizationToken: clearAuthorizationToken,
        getAuthorizationToken: getAuthorizationToken,
        setAuthorizationToken: setAuthorizationToken,

        // Navigation back context
        clearNavigationBackContext: clearNavigationBackContext,
        getNavigationBackContext: getNavigationBackContext,
        setNavigationBackContext: setNavigationBackContext
    };
    return service;

    function clearAuthorizationToken() {
        return _clearCache(SESSION_CACHE_AUTHORIZATION_TOKEN);
    }

    function getAuthorizationToken() {
        return _fromCache(SESSION_CACHE_AUTHORIZATION_TOKEN);
    }

    function setAuthorizationToken(authToken) {
        return _toCache(SESSION_CACHE_AUTHORIZATION_TOKEN, authToken);
    }

    function clearNavigationBackContext() {
        return _clearCache(SESSION_CACHE_NAVIGATION_BACK_CONTEXT);
    }

    function getNavigationBackContext() {
        return _fromCache(SESSION_CACHE_NAVIGATION_BACK_CONTEXT);
    }

    function setNavigationBackContext(context) {
        return _toCache(SESSION_CACHE_NAVIGATION_BACK_CONTEXT, context);
    }


    // ----------------------------------------------------------------- Session cache handling

    /**
     * @ngdoc method
     * @name sessionService#clearCache
     * @param {String} key The key of the value to clear
     * @returns {Promise} A promise returning the old value from the session cache
     * @description
     *
     * Clears the specified key from the session cache.
     */
    function _clearCache(key) {
        if (_.isString(key)) {
            return $q(function(resolve, reject) {
                _fromCache(key).then(function(oldvalue) {
                    localStorageService.remove(key);
                    resolve(oldvalue);
                });
            });
        } else {
            return $q.resolve();
        }
    }

    /**
     * @ngdoc method
     * @name sessionService#fromCache
     * @param {String} key The key of the value to return
     * @returns {Promise} A promise returning the value from the session cache
     * @description
     *
     * Gets a value saved in the session cache.
     */
    function _fromCache(key) {
        if (_.isString(key)) {
            return $q
                .resolve(localStorageService.get(key))
                .then(function(value) {
                    try {
                        value = JSON.parse(value);
                    } catch (error) {}
                    return value;
                });
        } else {
            return $q.resolve(null);
        }
    }

    /**
     * @ngdoc method
     * @name sessionService#toCache
     * @param {String} key The key of the value to return
     * @param {Object} value The value to put in the session cache
     * @returns {Promise} A promise returning the old value set under the specified key
     * @description
     *
     * Sets a value in the session cache under the specified key.
     */
    function _toCache(key, value) {
        if (_.isString(key)) {
            if (_.isArray(value) || _.isObject(value)) {
                value = JSON.stringify(value);
            }
            return _fromCache(key)
                .then(function(oldvalue) {
                    localStorageService.set(key, value);
                    return oldvalue;
                })
                .catch(function(error) {
                    // explicit catch, AngularJS 1.6
                    return $q.reject();
                });
        } else {
            return $q.resolve();
        }
    }
}

export default dataServiceSession;
