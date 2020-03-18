/*jshint -W101*/ //  Line too long
import _ from 'lodash';

const RESOURCE_NAME = 'reporting';

const run = ['config', 'DS', function (config, DS) {
    DS.defineResource({
        name: RESOURCE_NAME,
        basePath: (config.reporting) ? config.reporting.apiBase : undefined,
    });
}];

dataServiceReporting.$inject = ['$q', 'DS', 'sessionService', 'config'];

function dataServiceReporting($q, DS, session, config) {

    var service = {
        hasAccessToCompany: hasAccessToCompany
    };

    return service;


    function hasAccessToCompany(user, company) {
        if (user && company) {
            //user.username = 'reporting1';
            var endpoint = 'users/' + user.username + '/' + company.code + '/exists';
            return DS.findAll(RESOURCE_NAME, {},
                {
                    endpoint: endpoint,
                    bypassCache: true,
                    cacheResponse: false
                })
                .then(function (data) {
                    return _.isBoolean(data) ? data : false;
                })
                .catch(function () {
                    return false;
                });
        }
        else {
            return $q.resolve(false);
        }
    }
}

export {
    dataServiceReporting,
    run
}
