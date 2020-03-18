/*jshint -W101*/ //  Line too long

const RESOURCE_NAME = 'authentication';
const ENDPOINT_NAME_TOKEN = 'oauth2/token';
const ENDPOINT_NAME_REFRESH = 'oauth2/refresh';
const ENDPOINT_NAME_PROVIDER = 'idps';

const run =['config', 'DS', function(config, DS) {
    DS.defineResource({
        name: RESOURCE_NAME,
        basePath: config.apiAuth,
    });
}];

dataServiceAuthentication.$inject = ['$q', '$http', 'config', 'DS', 'dataservice.session', 'helpers', 'moment'];

/**
 * @ngdoc service
 * @module blocks.authentication
 * @name dataService.authentication
 * @description
 * The dataservice for the authentication endpoint.
 */
function dataServiceAuthentication($q, $http, config, DS, dataserviceSession, helpers, moment) {

    // Wire-up data services
    var resourceUserProfile = DS.definitions[RESOURCE_NAME];
    resourceUserProfile.afterCreate = function(Resource, data, cb) { return _deserializeAuthorizationToken(data); };

    var service = {
        clearAuthorizationToken: clearAuthorizationToken,
        getAuthorizationToken: getAuthorizationToken,
        refreshAuthorizationToken: refreshAuthorizationToken,
        getServiceProviders: getServiceProviders,
    };
    return service;

    function clearAuthorizationToken() {
        return dataserviceSession.clearAuthorizationToken();
    }

    /**
     * @ngdoc method
     * @name dataService.authentication#getAuthorizationToken
     * @param {String} jsonWebToken A JWT token usualy provided over the url during the application start.
     * @return {Promise}            Returns a promise that resolves with the authorization token.
     * @description                 Requests an authorization token based on a JWT token.
     *                              This authenticates the client on the server.
     */
    function getAuthorizationToken(jsonWebToken) {
        return $q.resolve()
            .then(function() {
                // If jsonWebToken is provided explicitly, request new token (replacing the current one)
                if (_.isString(jsonWebToken) && jsonWebToken.length > 0) {
                    var url = config.apiAuth + '/' + ENDPOINT_NAME_TOKEN;
                    return DS.adapters.http
                        .POST(url, jsonWebToken, { isAnonymous: true })
                        .then(function(result) {
                            return _cacheAuthorizationToken(result.data);
                        });
                }
            })
            .then(function() {
                // Restore token from session (used case when page is refreshed explicitly)
                return _getAuthorizationTokenFromCache();
            })
            .then(function(data) {
                return _deserializeAuthorizationToken(data);
            });

    }

    /**
     * @ngdoc method
     * @name dataService.authentication#refreshAuthorizationToken
     * @param {String} token        An authorization token containing the refresh token.
     * @return {Promise}            Returns a promise that resolves with the authorization token.
     * @description                 Requests a new authorization token based on a refresh token.
     *                              This authenticates the client on the server.
     */
    function refreshAuthorizationToken(token) {
        // Validate
        if (!token) { throw new Error('No authorization token provided.'); }

        return DS
            .create(RESOURCE_NAME, null, {
                endpoint: ENDPOINT_NAME_REFRESH + '?token=' + token.refreshToken,
                isAnonymous: true,
                bypassCache: true,
                cacheResponse: false
            })
            .then(function(token) {
                return _cacheAuthorizationToken(token);
            })
            .then(function() {
                return _getAuthorizationTokenFromCache();
            })
            .then(function(token) {
                return _deserializeAuthorizationToken(token);
            });
    }

    /**
     * @ngdoc method
     * @name dataService.authentication#getServiceProviders
     * @param {String} redirectUrl  The url to redirect to after an authorization token has been issued by the identity provider.
     * @return {Promise}            Returns a promise that resolves with a list of authentication providers.
     * @description                 Requests the list of possivle authentication providers through whom a user can request access to the application.
     */
    function getServiceProviders(redirectUrl) {
        return DS.findAll(RESOURCE_NAME, null, {
                endpoint: ENDPOINT_NAME_PROVIDER,
                isAnonymous: true
            })
            .then(function(providers) {
                return _.each(providers, function(provider) {
                    provider.url += encodeURIComponent(redirectUrl);
                });
            });
    }

    // -------------------------------------------------------- Serialization / Deserialization

    function _deserializeAuthorizationToken(data) {
        if (!_.isObject(data)) { return; }

        // Deserialize properties
        helpers.toDate(data, 'expirationDate');

        // Add 'isValid' function
        data.isValid = function() {
            return true

            // Check required properties
                &&
                _.isString(this.accessToken) &&
                _.isString(this.refreshToken)

            // Check expiration date
            &&
            _.isDate(this.expirationDate) && moment(this.expirationDate).isAfter(moment());
        };

        return data;
    }

    // ------------------------------------------------------------------------- Cache handling

    function _cacheAuthorizationToken(token) {
        if (_.isObject(token)) {
            // Cache token, so we don't loose it when page gets refreshed manually
            return dataserviceSession.setAuthorizationToken(token);
        } else {
            // Clear token from session cache
            return dataserviceSession.clearAuthorizationToken();
        }
    }

    function _getAuthorizationTokenFromCache() {
        return dataserviceSession.getAuthorizationToken();
    }
}

export {
    dataServiceAuthentication,
    run
};
