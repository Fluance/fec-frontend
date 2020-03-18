/*jshint -W101*/ //  Line too long

const RESOURCE_NAME = 'jwt';
const ENDPOINT_NAME = 'jwt/token';

const run = ['config', 'DS', function(config, DS) {
    DS.defineResource({
        name: RESOURCE_NAME,
        endpoint: ENDPOINT_NAME,
        basePath: config.apiAuth,
    });
}];


dataServiceJWT.$inject = ['config', 'DS'];

/**
 * @ngdoc service
 * @module blocks.authentication
 * @name dataService.jwt
 * @description
 * The dataservice for the JWT endpoint.
 */
function dataServiceJWT(config, DS) {

    var service = {
        getJwt: getJwt
    };

    return service;

    function getJwt(issuer) {
        return DS.adapters.http
            .GET(config.apiAuth + '/' + ENDPOINT_NAME + '/default', {
                params: { trustedPartner: issuer }
            })
            .then(function(result) {
                return result.data;
            })
            .catch(function(error) {
                console.error(error);
            });
    }
}

export {
    dataServiceJWT,
    run
};
