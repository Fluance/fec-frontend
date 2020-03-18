import _ from 'lodash';

/**
 * @ngdoc service
 * @module reporting
 * @name reportingService
 * @description
 *
 * The Reporting service is the interface all Reporting components talk to.
 */

reportingService.$inject = ['$q', 'sessionService', 'dataservice.reporting'];

/* @ngInject */
function reportingService($q, session, dataserviceReporting) {

    var _config, _issuer;
    var _isActive = false;
    var _isInternalAccessor = false;

    var service = {
        // Constants
        CONTEXT_PATIENT: 'patient',
        CONTEXT_VISIT: 'visit',

        // Methods
        init: init,
        isActive: isActive,
        isInternalAccessor: isInternalAccessor,

        // Deep-link-button methods
        hasAccessToSelectedCompany: hasAccessToSelectedCompany,
        getDeepLink: getDeepLink,
        getToken: undefined
    };

    return service;


    // ------------------------------------------------------------------- Configration methods

    function init(config) {
        if (!_.isObject(config)) { return; }

        _config = config;
        _issuer = (_config && _config.issuer) ? _config.issuer : undefined;
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

    function isInternalAccessor(value) {
        if (_.isUndefined(value)) {
            return _isInternalAccessor;
        }
        else {
            var oldValue = _isInternalAccessor;
            _isInternalAccessor = value;
            return oldValue;
        }
    }

    // --------------------------------------------------------------- Deep-link button methods

    function hasAccessToSelectedCompany() {
        return dataserviceReporting.hasAccessToCompany(session.user, session.getSelectedCompany());
    }

    function getDeepLink(contextName, contextId) {
        // Validate
        if (!_.isFunction(service.getToken) || service.getToken.length !== 1) {
            // Expecting a function taking the issuer as parameter.
            // This function should be defined during initialisation of this service
            // (i.e. during the application bootstrap 'app.run')
            return $q.reject('Not implemented exception: Provide a function that returns a promise getting a JWT.');
        }

        return service.getToken(_issuer)
            .then(function(jwt) {
                // Validate
                if (!jwt) { return; }

                var selectedCompany = session.getSelectedCompany();
                var paramLanguage = session.getUILanguage();
                var paramJwt = jwt;
                var paramCompanyCode = (selectedCompany) ? selectedCompany.code : '';

                var navUrl;
                switch (contextName) {
                    case service.CONTEXT_PATIENT:
                        navUrl = '/#/patients/' + contextId;
                        break;

                    case service.CONTEXT_VISIT:
                        navUrl = '/#/visits/' + contextId;
                        break;
                }

                return _config.urlBase + navUrl + '?companyCode=' + paramCompanyCode + '&lang=' + paramLanguage + '&jwt=' + paramJwt;
            });
    }
}

export default reportingService;
