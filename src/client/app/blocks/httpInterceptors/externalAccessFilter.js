const HEADER_EXTERNAL_ACCESS = 'x-request-from-internet';

const config = ['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push('externalAccessFilter');
}];


externalAccessFilter.$inject = ['config', 'logger'];

/**
 * @ngdoc service
 * @module app
 * @name externalAccessFilter
 * @requires configProvider
 * @requires logger
 * @description
 *
 * External Access Filter
 * To hide some UI elements (mostly because they are not functional from external networks)
 * the app uses an http Interceptor to check if a specified header is present.
 * The customers proxy will inject the header into all outgoing responses so that the app
 * can check the presence and therefore set a state.
 * Responses, why? Why not requests?
 * This is a client-side application, it can only know if its in- or external by looking
 * at responses from the API.
 *
 * ** We are aware that this is not completely hiding stuff from the user, he can still
 * look at it by modyfing some JS. But since this interceptor works only as a UI improvement,
 * this does not matter! If one day, some sensitive data has to be hidden, we need another concept.**
 */
function externalAccessFilter(config, logger) {
    var loggedMessage = false;

    function printMode(msg) {
        logger.log('External Access Filter: ' + msg);
        loggedMessage = true;
    }

    /**
     * @ngdoc method
     * @name externalAccessFilter#onResponse
     * @param {HTTP-Response} [response]     HTTP Response
     * @returns {HTTP-Response} [Potentially modified response]
     * @description
     *
     * Checks presence of 'external access filter' - header in response
     * If present, sets current config to config.externalAccessor
     *
     * **This method must be named onResponse because it gets called by the interceptor!**
     *
     */
    var onResponse = function (response) {
        if (response.config.url.indexOf(config.apiBase) === 0) {
            if (angular.isDefined(response.headers) && angular.isString(response.headers(HEADER_EXTERNAL_ACCESS))) {
                config.externalAccessor = true;
                if (!loggedMessage) {
                    printMode('Requests are passing customer\'s proxy, app state is EXTERNAL.');
                }
            } else {
                // This scenario is highly unlikely, but we got it covered (Physician en-/disabling VPN)
                // There will be no message to the console when the state switches ! ! !
                config.externalAccessor = false;
                if (!loggedMessage) {
                    printMode('Requests are within customer network, app state is INTERNAL.');
                }
            }
        } else {
            // We ensure to only change the APPs state when an API call response has the header set
            // We do not switch the APPs state when loading static content!
        }
        return response;
    };

    return {
        'response': onResponse
    };
}



export {
    externalAccessFilter,
    config
}
