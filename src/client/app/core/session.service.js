sessionService.$inject = [
    '$q',
    '$rootScope',
    '$translate',
    '$window',
    'authenticationService',
    'config',
    'localizationService',
    'logger',
    'userService',
    'moment',
    'routerService',
    '$state'
];

/**
 * @ngdoc       service
 * @module      app
 * @name        sessionService
 * @description
 *
 * Handles session state as well as session cache handling for the application.
 */
function sessionService($q, $rootScope, $translate, $window, auth, config, localizationService,
    logger, userService, moment, routerService, $state) {

    // Private properties
    var _isAuthenticated;
    var _overrides; // Object with session values to override with query parameters

    var service = {
        // Constants
        EVENT_AUTHENTICATION_CHANGED: '$authenticationChanged',
        AUTHENTICATION_CHANGED_REASONS: {
            LOGIN: 'LOGIN',
            LOGOUT: 'LOGOUT',
            SESSION_TIMEOUT: 'SESSION_TIMEOUT',
            NO_PROFILE: 'NO_PROFILE'
        },
        EVENT_SELECTED_COMPANY_CHANGED: 'fec-selectedCompanyChanged',
        EVENT_SELECTED_SERVICE_CHANGED: 'fec-selectedServiceChanged',
        EVENT_SELECTED_UNIT_CHANGED: 'fec-selectedUnitChanged',

        EVENT_USER_DATA_CHANGED: 'fec-userDataChanged',
        EVENT_USER_PROFILE_CHANGED: 'fec-userProfileChanged',

        PARAMETER_TOKEN: 'queryToken',
        PARAMETER_LANGUAGE: 'queryLanguage',
        PARAMETER_COMPANY_CODE: 'queryCompanyCode',

        // Properties
        user: null, // Currently logged-in user

        // Methods
        isAuthenticated: isAuthenticated,
        getSelectedCompany: getSelectedCompany,
        getSelectedCompanyHospServices: getSelectedCompanyHospServices,
        getSelectedCompanyUnits: getSelectedCompanyUnits,
        getPreferredService: getPreferredService,
        getPreferredUnit: getPreferredUnit,
        setPreferredService: setPreferredService,
        setPreferredUnit: setPreferredUnit,
        getUILanguage: getUILanguage,
        loadUser: loadUser,
        setCompaniesUnitsServicesOrder: setCompaniesUnitsServicesOrder,
        setUILanguage: setUILanguage,
        setUserParameter: setUserParameter,
        getQueryToken: getQueryToken,

        // Methods: session authentication
        login: login,
        logout: logout
    };

    init();
    return service;

    // ------------------------------------------------------------------------- Initialization

    function init() {
        // initialize authentication
        _isAuthenticated = false;

        // initialize user parameters overrides
        _overrides = {};

        auth.authenticationChanged.subscribe(onAuthenticationChanged);
        routerService.stateChangedSuccess.subscribe(_onStateChangedSuccess);
    }

    // ------------------------------------------------------------------------- Authentication

    /**
     * @ngdoc method
     * @name sessionService#isAuthenticated
     * @returns {boolean}
     * @description
     *
     * Gets the value indicating whether the current session is logged-in.
     * The session is considered being logged-in, when authentication has a valid authorization token
     * and the user profile is loaded.
     */
    function isAuthenticated() {
        return _isAuthenticated && _.isObject(service.user);
    }

    /**
     * @ngdoc method
     * @name sessionService#login
     * @param   {string | Object}   jsonWebToken   The json web token required when authenticating
     *                                             against the server.
     * @returns {Promise}
     * @description
     *
     * Logs in a user using either a specified json-web-token (if found as query parameter in the url)
     * or an existing authentiation token found in the session cache.
     */
    function login() {
        var jsonWebToken = _overrides.queryToken;
        var oldIsAuthenticated = service.isAuthenticated();

        return auth.getAuthorizationToken(jsonWebToken)
            .then(function () {
                // Load user (profile and user-data)
                return _loadUser();
            })
            .catch(function (error) {
                return $q.reject({ status: 403, message: 'Error during login. No authorization token found or unable to load user.' });
            })
            .finally(function () {
                // Update localization
                var language = service.getUILanguage();
                localizationService.setUILanguage(language);

                // Notify
                if (oldIsAuthenticated !== service.isAuthenticated()) {
                    _onAuthenticationChanged(service.AUTHENTICATION_CHANGED_REASONS.LOGIN);
                }
            });
    }

    /**
     * Return the query token
     */
    function getQueryToken() {
        return _overrides.queryToken;
    }

    /**
     * @ngdoc method
     * @name sessionService#logout
     * @returns {Promise}
     * @description
     *
     * Logs out the current user and clears the session (including the session cache).
     */
    function logout() {
        var oldIsAuthenticated = service.isAuthenticated();
        var noSessionTimeout = true;

        // Clear token passed from query parameters
        _overrides.queryToken = undefined;

        // Release authorization token
        var redirectUrl = config.baseURL;
        return auth.clearAuthorizationToken(redirectUrl, noSessionTimeout)
            .then(function () {
                // Clear user
                service.user = null;
            })
            .finally(function () {
                if (oldIsAuthenticated !== service.isAuthenticated()) {
                    _onAuthenticationChanged(service.AUTHENTICATION_CHANGED_REASONS.LOGOUT);
                }
            });
    }

    // Event handler of AuthenticationService.authenticationChanged
    function onAuthenticationChanged(args) {
        var oldIsAuthenticated = service.isAuthenticated();

        _isAuthenticated = args.isAuthenticated || false;

        // Notify
        if (oldIsAuthenticated !== service.isAuthenticated()) {
            var reason = (!args.isAuthenticated) ? service.AUTHENTICATION_CHANGED_REASONS.SESSION_TIMEOUT : undefined;
            _onAuthenticationChanged(reason);
        }
    }

    function _onAuthenticationChanged(reason) {
        $rootScope.$broadcast(service.EVENT_AUTHENTICATION_CHANGED, {
            isAuthenticated: service.isAuthenticated(),
            reason: reason,
            user: service.user
        });
    }

    function _onStateChangedSuccess(args) {
        if ($state.current.name !== 'serviceDiscovery' && $state.current.name !== 'error' && isAuthenticated()) {
            service.user.setUserData({
                'lastState': {
                    'name': $state.current.name,
                    'params': $state.params
                }
            })
                .catch(function (error) {
                    // explicit catch, AngularJS 1.6+
                })
        }
    }

    // --------------------------------------------------------------------------- User context

    function getSelectedCompany() {
        return (service.user && service.user.company) ? service.user.company : null;
    }

    function getSelectedCompanyHospServices() {
        if (service.user && !service.user.companyId && service.user.companies && service.user.companies.length) {
            service.user.companyId = service.user.companies[0].id;
        }
        var selectedCompany = (service.user) ? _.find(service.user.companies, { id: service.user.companyId }) : undefined;
        if (selectedCompany) {
            if (!getPreferredService(selectedCompany.hospServices)) {
                var firstService = _.first(selectedCompany.hospServices);
                if (!!firstService) {
                    setPreferredService(firstService.code);
                }
            }
            return selectedCompany.hospServices;
        } else {
            return undefined;
        }
    }

    function getSelectedCompanyUnits() {
        if (service.user && !service.user.companyId && service.user.companies && service.user.companies.length) {
            service.user.companyId = service.user.companies[0].id;
        }
        var selectedCompany = (service.user) ? _.find(service.user.companies, { id: service.user.companyId }) : undefined;
        if (selectedCompany) {
            if (!getPreferredUnit(selectedCompany.units)) {
                var firstUnit = _.first(selectedCompany.units);
                if (!!firstUnit) {
                    setPreferredUnit(firstUnit.code);
                }
            }
            return selectedCompany.units;
        } else {
            return undefined;
        }
    }

    function getPreferredUnit(units) {
        var preferredUnit = (service.user) ? _.find(service.user.preferredUnits, { companyId: service.user.companyId }) : undefined;
        if (_.isUndefined(preferredUnit)) {
            return undefined;
        }
        return !!_.find(units, { code: preferredUnit.code }) ? preferredUnit : undefined;
    }

    function setPreferredUnit(code) {
        var preferredUnits = service.user.preferredUnits;
        preferredUnits = !!preferredUnits ? preferredUnits : [];
        var preferredUnit = _.find(preferredUnits, { companyId: service.user.companyId });
        if (!preferredUnit) {
            preferredUnits.push({
                companyId: service.user.companyId,
                code: code
            });
        } else if (preferredUnit.code !== code) {
            preferredUnit.code = code;
        } else {
            return $q.resolve();
        }
        return $q.resolve()
            .then(function () {
                if (service.user) {
                    return service.user.setUserData({ preferredUnits: preferredUnits });
                }
            })
            .catch(function (exception) {
                return $q.reject('Error while changing user preferredUnit');
            });
    }

    function getPreferredService(hospServices) {
        var preferredService = (service.user) ? _.find(service.user.preferredServices, { companyId: service.user.companyId }) : undefined;
        if (_.isUndefined(preferredService)) {
            return undefined;
        }
        return !!_.find(hospServices, { code: preferredService.code }) ? preferredService : undefined;
    }

    function setPreferredService(code) {
        var preferredServices = service.user.preferredServices;
        preferredServices = !!preferredServices ? preferredServices : [];
        var preferredService = _.find(preferredServices, { companyId: service.user.companyId });
        if (!preferredService) {
            preferredServices.push({
                companyId: service.user.companyId,
                code: code
            });
        } else if (preferredService.code !== code) {
            preferredService.code = code;
        } else {
            return $q.resolve();
        }
        return $q.resolve()
            .then(function () {
                if (service.user) {
                    return service.user.setUserData({ preferredServices: preferredServices });
                }
            })
            .catch(function (exception) {
                return $q.reject('Error while changing user preferredService');
            });
    }

    function getUILanguage() {
        var userLanguage;

        // Determine user language
        if (service.user) {
            userLanguage = service.user.preferredLanguage || service.user.profileLanguage;
        }

        // Determine language between user language and fallback
        return userLanguage || config.defaultLanguage;
    }

    function setUILanguage(language) {
        if (!_.isString(language) && language.length !== 2) { return $q.reject(); }

        return $q.resolve()
            .then(function () {
                if (service.user) {
                    return service.user.setUserData({ preferredLanguage: language });
                }
            })
            .then(function () {
                return localizationService.setUILanguage(language);
            })
            .then(function () {
                $rootScope.$broadcast('translationChanged', language);
            })
            .catch(function (exception) {
                return $q.reject('Error while changing user preferredLanguage');
            });
    }

    function setCompaniesUnitsServicesOrder(companies) {
        var companiesUnitsServicesOrder = [];
        _.each(companies, function (company) {
            var currentCompany = {
                companyId: company.id,
                units: [],
                services: []
            };
            _.each(company.units, function (unit) {
                currentCompany.units.push(unit.code);
            });
            _.each(company.hospServices, function (service) {
                currentCompany.services.push(service.code);
            });
            companiesUnitsServicesOrder.push(currentCompany);
        });
        return $q.resolve()
            .then(function () {
                if (service.user) {
                    return service.user.setUserData({ companiesUnitsServicesOrder: companiesUnitsServicesOrder });
                }
            })
            .catch(function (exception) {
                return $q.reject('Error while updating company units/services order');
            });
    }

    function setUserParameter(key, value) {
        if (_.isString(key) && !_.isEmpty(value)) {
            _overrides[key] = value;
        }
    }

    function loadUser() {
        return _loadUser()
            .then(function () {
                _onAuthenticationChanged();
            });
    }

    function _loadUser() {
        return userService.getUser()
            .then(function (user) {
                _setUser(user);

                // Override user preferences with query parameters
                var overrides = {};
                if (_overrides.queryLanguage) {
                    overrides.preferredLanguage = _overrides.queryLanguage;
                }
                if (overrides.queryCompanyCode) {
                    var company = _.find(service.user.companies, { code: _overrides.queryCompanyCode.toUpperCase() });
                    if (company) { overrides.companyId = company.id; }
                }
                // TODO (YA): set companie -> unit/service order
                if (_.keys(overrides).length > 0) {
                    return service.user.initializeUserData(overrides);
                }
            });
    }

    function _getCompanyUnitsAndServicesOrder(companyId) {
        return _.find(service.user.companiesUnitsServicesOrder, { companyId: companyId });
    }

    function _getSortedCompanyUnits(companyId, units) {
        var unitsAndServicesOrdered = _getCompanyUnitsAndServicesOrder(companyId);
        if (unitsAndServicesOrdered && unitsAndServicesOrdered.units && unitsAndServicesOrdered.units.length >= 1) {
            return _.sortBy(units, (unit) => {
                return _.indexOf(unitsAndServicesOrdered.units, unit.code);
            });
        }
        return units;
    }

    function _getSortedCompanyServices(companyId, services) {
        var unitsAndServicesOrdered = _getCompanyUnitsAndServicesOrder(companyId);
        if (unitsAndServicesOrdered && unitsAndServicesOrdered.services && unitsAndServicesOrdered.services.length >= 1) {
            return _.sortBy(services, (service) => {
                return _.indexOf(unitsAndServicesOrdered.services, service.code);
            });
        }
        return services;
    }

    function _setUser(user) {
        // Unsubscribe from events
        if (service.user) {
            service.user.userProfileChanged.unsubscribe(_onUserProfileChanged);
            service.user.userDataChanged.unsubscribe(_onUserDataChanged);
            service.user.selectedCompanyChanged.unsubscribe(_onSelectedCompanyChanged);
        }

        // Set new user
        service.user = user;

        if (service.user && service.user.companiesUnitsServicesOrder) {
            _.each(service.user.companies, (company) => {
                company.units = _getSortedCompanyUnits(company.id, company.units);
                company.hospServices = _getSortedCompanyServices(company.id, company.hospServices);
            });
        }

        // Subscribe to events
        if (service.user) {
            service.user.userProfileChanged.subscribe(_onUserProfileChanged);
            service.user.userDataChanged.subscribe(_onUserDataChanged);
            service.user.selectedCompanyChanged.subscribe(_onSelectedCompanyChanged);
        }
    }

    // -------------------------------------------------------------------- User event handling

    function _onUserDataChanged() {
        $rootScope.$emit(service.EVENT_USER_DATA_CHANGED);
    }

    function _onUserProfileChanged() {
        $rootScope.$emit(service.EVENT_USER_PROFILE_CHANGED);
    }

    function _onSelectedCompanyChanged() {
        $rootScope.$emit(service.EVENT_SELECTED_COMPANY_CHANGED);
    }
}

export default sessionService;
