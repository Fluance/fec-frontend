import { satisfies } from "semver";

routerServiceProvider.$inject = ['$locationProvider', '$stateProvider', '$urlRouterProvider', 'configProvider'];

function routerServiceProvider($locationProvider, $stateProvider, $urlRouterProvider, configProvider) {
    var routingConfig;

    var provider = {
        $get: ['$rootScope', '$translate', '$q', '$transitions', '$state', 'config', 'Event', routerServiceFactory],
        configure: configure,
        configureUrlInfo: configureUrlInfo
    };

    onInit();
    return provider;

    // ------------------------------------------------------------------------- Initialization

    function onInit() {
        routingConfig = {
            //resolveAlways: {}
        };

        // if html5mode is activated we put it in our application
        $locationProvider.html5Mode({
            enabled: configProvider.config.html5mode,
            requireBase: false
        });
    }

    // --------------------------------------------------------------- Interface implementation

    function routerServiceFactory($rootScope, $translate, $q, $transitions, $state, config, Event) {
        var instance = new RouterService($rootScope, $translate, $q, $transitions, $urlRouterProvider, $state, $stateProvider, config, Event);
        instance.config = routingConfig;
        instance.defaultRoutingState = configProvider.config.routing.defaultState;
        instance.urlInfo = routingConfig.urlInfo;

        return instance;
    }

    function configure(configuration) {
        routingConfig = _.extend(routingConfig, configuration);
    }

    function configureUrlInfo(location) {
        var urlInfo = _parseUrl(location);
        provider.configure({
            urlInfo: urlInfo
        });

        // Remove all query parameters from URL to hide the token
        if (urlInfo.query.token) {
            var url = urlInfo.path;
            if (urlInfo.hash && urlInfo.hash.length > 0) { url += '#' + urlInfo.hash; }

            window.history.replaceState(null, null, url);
        }
    }
}


// --------------------------------------------------------------- Routing service implementation

function RouterService($rootScope, $translate, $q, $transitions, $urlRouterProvider, $state, $stateProvider, config, Event) {
    var handlingStateChangeError = false;
    var stateCounts = {
        errors: 0,
        changes: 0
    };

    var service = {
        // Constants
        STATE_ERROR: 'error',
        STATE_MAINTENANCE: 'maintenance',
        STATE_SERVICE_DISCOVERY: 'serviceDiscovery',

        // Properties
        defaultRoutingState: null,
        config: null,
        stateCounts: stateCounts,
        urlInfo: null,

        // Events
        stateChangedSuccess: new Event(),

        // Methods
        configureStates: configureStates,
        updateUrlInfo: updateUrlInfo,
        registerRoutingEvents: registerRoutingEvents,
        setExpectedUserParameters: setExpectedUserParameters
    };

    return service;

    // --------------------------------------------------------------- Interface implementation

    function configureStates(states) {
        states.forEach(function (state) {
            // Skip registration, if state is excluded by configuration
            if (config.routing && _.includes(config.routing.invalidStates || [], state.state)) { return; }

            // Initialize config
            if (!state.config) { state.config = {}; }

            // TODO (LB)
            // mechanism to allow to plug-in a "global" Resolvable:
            // - not used at the moment
            // - must be changed for new API (router v.1)
            //state.config.resolve = _.extend(state.config.resolve || {}, service.config.resolveAlways); // v0.2

            // Initialize config.accessControl
            if (!state.config.accessControl) { state.config.accessControl = {}; }
            // configure: state authentication
            if (!_.isBoolean(state.config.accessControl.allowAnonymous)) { state.config.accessControl.allowAnonymous = false; }
            // configure: state authorization
            const stateName = _.camelCase(state.state);
            if (_.isArray(_.get(config, 'accessControl.states[' + stateName + '].restrictToRoles'))) {
                state.config.accessControl.restrictToRoles = _.get(config, 'accessControl.states[' + stateName + '].restrictToRoles');
            } else if (!_.isArray(_.get(state, 'config.accessControl.restrictToRoles'))) {
                state.config.accessControl.restrictToRoles = [];
            }

            // Register routing state
            $stateProvider.state(state.state, state.config);
        });
    }

    /**
     * @ngdoc method
     * @name  routerService#updateUrlInfo
     * @param {Object}  location    The window.location object.
     * @description
     * Updates the urlInfo property of this service.
     * The urlInfo reflects the different segments of the current url.
     **/
    function updateUrlInfo(location) {
        service.urlInfo = _parseUrl(location);
    }

    /**
     * Register routing events
     * In router v.1 use new API with Transition Hooks
     * @param session
     */
    function registerRoutingEvents(session) {
        // Register state transition hooks (ui-router 1.x): Occurs every time we transition to a (new) state (several transition lifecycle events)
        // see: https://ui-router.github.io/guide/transitionhooks
        $transitions.onBefore({}, function (transition) {
            return _handleBeforeTransition(transition, session);
        });
        $transitions.onSuccess({}, _handleSuccessTransition);
        $transitions.onError({}, _handleErrorTransition);

        // Fallback route handling
        $urlRouterProvider.otherwise(_handleStateNotFound);
    }

    /**
     * Set expected user query parameters in user session
     * @param session
     */
    function setExpectedUserParameters(session) {
        var userParams = service.urlInfo.query;

        // Store query parameters in session (overrides)
        if (userParams.token) { session.setUserParameter(session.PARAMETER_TOKEN, userParams.token); }
        if (userParams.lang) { session.setUserParameter(session.PARAMETER_LANGUAGE, userParams.lang); }
        if (userParams.companyCode) { session.setUserParameter(session.PARAMETER_COMPANY_CODE, userParams.companyCode); }
    }

    // --------------------------------------------------------------- UI-Router event handling

    /**
     * Intercept every state transition and determine which should be the target state based on user authentication and authorization.
     * Also, add resolvables (eg: loading translations)
     * @param transition
     * @param session
     * @return return a Promise. Transition will pause and wait for the promise to resolve/reject.
     * @private
     */
    function _handleBeforeTransition(transition, session) {
        var toState = transition.to();
        var toParams = transition.params('to');
        var deferred = $q.defer();

        // -----------------------------------
        // Add Resolvables
        // -----------------------------------

        // Update required translation parts
        transition.addResolvable({
            token: 'determineTranslation',
            deps: ['$translate', 'fluanceTranslatePartialLoader'],
            resolveFn: function ($translate, fluanceTranslatePartialLoader) {

                // Add static parts
                fluanceTranslatePartialLoader.addPart('core');
                fluanceTranslatePartialLoader.addPart('error');
                fluanceTranslatePartialLoader.addPart('layout');
                fluanceTranslatePartialLoader.addPart('search');

                // Add route-specific parts
                fluanceTranslatePartialLoader.loadTranslations(toState);

                // Update translation tables
                return $translate.refresh();
            }
        });

        // -----------------------------------
        // handle State transition
        // -----------------------------------

        // Determine the new state to transition to
        _determineState($q, config, session, toState, toParams)
            .then(function (targetState) {
                // if is new state, redirect router to new ("target") state
                if (toState.name !== targetState.stateName) {
                    // Route to new state
                    if (console.debug) {
                        console.debug('[routerService] Redirect from \'' + toState.name + '\' to \'' + targetState.stateName + '\'.');
                    }
                    deferred.resolve($state.target(targetState.stateName, targetState.stateParams)); // resolve with new state
                }
                // otherwise, proceed to "to" state
                else {
                    deferred.resolve(true);
                }
            });

        // return Promise (resolved by state navigation)
        return deferred.promise;
    }

    /**
     * Handle successful state transition
     * @param transition
     * @private
     */
    function _handleSuccessTransition(transition) {
        var fromState = transition.from();
        var toState = transition.to();
        var toParams = transition.params('to');

        // Notify
        service.stateChangedSuccess.raise({
            state: toState,
            params: toParams
        });

        // Update last state
        $state.fluanceSecondLastState = $state.fluanceLastState ? $state.fluanceLastState : undefined;
        $state.fluanceLastState = (!!toState && !!fromState && toState.name !== '' && fromState.name !== '') ? { state: toState, params: toParams } : undefined;

        // Update page title (translate, but don't propagate exception to router)
        $translate(toState.titleI18n).then(function (pageTitle) {
            var updatedTitle = config.titleShort + ' - ' + (pageTitle || '');
            $rootScope.title = updatedTitle;
        })
            .catch(function (error) {
                console.log(error);
                $rootScope.title = config.titleShort + ' - ' + config.title;
            });
    }

    /**
     * Handle failed state transition
     * @param transition
     * @private
     */
    function _handleErrorTransition(transition) {
        var toState = transition.to();
        var error = transition.error();
        var isRedirect = error.redirected;
        var isIgnored = transition.ignored(); // eg: state A => state A

        // transition was not completed, but it's not an error.
        // eg: redirected to another state, or transition to same state (transition ignored)
        if (isRedirect || isIgnored || handlingStateChangeError) {
            return;
        }

        stateCounts.errors++;
        handlingStateChangeError = true;

        var destination = (toState) ? (toState.titleI18n || 'unknown target') : 'unknown target';
        var errorData = (error) ? (error.data || '') : '';
        var errorStatus = (error) ? (error.status || '') : '';
        var errorStatusText = (error) ? (error.statusText || '') : '';

        // Navigate to error state
        $state.go('error', {
            errorCode: 'INVALID_ROUTING',
            errorParams: {
                DESTINATION: destination,
                DATA: errorData,
                STATUS: errorStatus,
                STATUS_TEXT: errorStatusText
            }
        });
    }

    /**
     * Handle state not found (fallback)
     * @private
     */
    function _handleStateNotFound() {
        var stateName, stateParams;

        if (service.urlInfo.hash.length === 0) {
            // No navigation link found -> go to default state
            stateName = service.defaultRoutingState.name;
            stateParams = service.defaultRoutingState.params;
        } else {
            // Invalid deep-link -> go to error state
            stateName = service.STATE_ERROR;
            stateParams = { errorCode: 'INVALID_URL' };
        }

        // Add query parameters
        stateParams = _.extend(stateParams || {}, service.urlInfo.query);
        $state.go(stateName, stateParams);
    }

    /**
     * Determine the new state to navigate to.
     * @param $q
     * @param config
     * @param session
     * @param toState
     * @param toStateParams
     * @private
     */
    function _determineState($q, config, session, toState, toStateParams) {
        // Validate
        if (!toState) { throw 'Argument \'toState\' cannot be undefined.'; }
        if (!service.defaultRoutingState) { throw 'DefaultRoutingState no set.'; }

        // Stop users (except dev) who do not use HTTPS
        if (!config.debugHttpEnabled && window.location.protocol !== 'https:') {
            return $q.resolve({ stateName: service.STATE_ERROR, stateParams: { errorCode: 'HTTP_WARN' } });
        }

        // Always redirect to 'maintenance' if config is in maintenance
        if (config.maintenance) {
            return $q.resolve({ stateName: service.STATE_MAINTENANCE, stateParams: undefined });
        }

        return $q.resolve()
            .then(function () {
                // ------------------------------------------------------------------------------------------------
                // Case 1. Anonymous state:
                // ==>> ALWAYS allow states granting ANONYMOUS access
                // ------------------------------------------------------------------------------------------------

                // User is not logged in -> login using token from the query parameters
                if (!session.isAuthenticated()) {
                    return session.login();
                }

                // i.e. ServiceDiscovery, Error
                // Useless because if you try to login the user and it fails, he will be redirected to the service-discovery
                if (toState.accessControl.allowAnonymous) {
                    return { stateName: toState.name, stateParams: toStateParams };
                }
            })
            .then(function () {
                // -------------------------------------------------------------------------------------------------------
                // Case 2. User is authenticated (has token) AND is "user authentication" state:
                // ==>> Forward to default routing state when a token is present (no need to log in again)
                // -------------------------------------------------------------------------------------------------------

                // ..............................................................................
                // NOTE (LB) -- possibility to make more generic:
                // Define "user authentication" state(s)
                // ..............................................................................
                // toState is a "user authentication" state (eg: serviceDiscovery)
                // targetState is the "default routing" state
                // ..............................................................................
                // eg: "user authentication" state = "serviceDiscovery", "default routing" state = "mycockpit"
                // ..............................................................................
                if (session.isAuthenticated() && toState.name === service.STATE_SERVICE_DISCOVERY) {
                    return { stateName: service.defaultRoutingState.name, stateParams: service.defaultRoutingState.params };
                }

                // ------------------------------------------------------------------------
                // Case 3. User not authenticated (no token) AND is not user authentication state:
                // ==>> Redirect user to authentication page
                // ------------------------------------------------------------------------

                // ..............................................................................
                // NOTE (LB) -- possibility to make more generic:
                // Define "user authentication" state(s)
                // ..............................................................................
                // toState is not a "user authentication" state (eg: serviceDiscovery)
                // ..............................................................................
                // eg: "user authentication" state = "serviceDiscovery"
                // ..............................................................................
                if (!session.isAuthenticated() && !toState.accessControl.allowAnonymous) {
                    return { stateName: service.STATE_SERVICE_DISCOVERY, stateParams: toStateParams };
                }

                // ------------------------------------------------------------------------
                // Case 4. User is not authorized (role-based access control)
                // ------------------------------------------------------------------------

                // Check role based access control
                if ((toState.accessControl.restrictToRoles.length > 0) &&
                    (session.user && !session.user.hasRole(toState.accessControl.restrictToRoles))) {
                    // If the user doesn't have the permission (role) to access the toState, redirect to error
                    return { stateName: service.STATE_ERROR, stateParams: { errorCode: 'ACCESS_DENIED' } };
                }

                // ------------------------------------------------------------------------
                // 5. Default case, allow transition to requested state
                // ------------------------------------------------------------------------
                return { stateName: toState.name, stateParams: toStateParams };
            })
            .catch(function (exception) {
                console.warn('[routerService]', exception);
                var targetState = { stateName: service.STATE_ERROR, stateParams: undefined };
                switch (exception.status) {
                    case 401:
                        targetState.stateParams = { errorCode: 'ACCESS_DENIED' };
                        break;
                    case 404:
                        targetState.stateParams = { errorCode: 'NO_PROFILE' };
                        break;
                    case 403:
                        // authentication needed: set target state to (default) authentication page
                        var serviceDiscoveryExists = _.isString($state.href(service.STATE_SERVICE_DISCOVERY));
                        if (serviceDiscoveryExists) {
                            targetState.stateName = service.STATE_SERVICE_DISCOVERY;

                            // Update urlInfo (required for redirectUrl in service discovery)
                            service.updateUrlInfo(window.location);
                        } else {
                            // Service discovery is not supported
                            targetState.stateParams = { errorCode: 'ACCESS_DENIED' };
                        }

                        // if not authenticated and have querytoken (prevent looping)
                        if (!session.isAuthenticated() && session.getQueryToken()) {
                            targetState = { stateName: service.STATE_ERROR, stateParams: { errorCode: session.AUTHENTICATION_CHANGED_REASONS.NO_PROFILE } };
                        }
                        break;
                }
                return targetState;
            });
    }
}

// ------------------------------------ Common functions (used by the provider and the service)

/**
 * Parse URL
 * @param location
 * @returns {{path: string, hash: string, query: {}, getHashString: getHashString, getQueryString: getQueryString}}
 * @private
 */
function _parseUrl(location) {
    var queryParams;
    var hash = location.hash; // default hash value

    // look for params in query string
    queryParams = (location.search.length > 0) ? location.search.substr(1).split('&') : [];

    // couldn't find params in query string. Look for user params in hash (deeplink).
    if (_.isEmpty(queryParams)) {
        if (location.hash.length > 0) {
            // get hash (deeplink) params
            var hashParamsMarkerPos = location.hash.indexOf('?');

            if (hashParamsMarkerPos > 0) {
                var hashParams = location.hash.substr(hashParamsMarkerPos + 1).split('&');

                // look for user params
                var expectedUserParams = ['token', 'lang', 'companyCode'];
                expectedUserParams.forEach(function (userParam) {
                    var index = _.findIndex(hashParams, function (item) { return item.indexOf(userParam + '=') === 0; });
                    if (index > -1) {
                        // move user param from hash (deeplink) to list of query params
                        queryParams.unshift(hashParams[index]);
                        hashParams = _.without(hashParams, hashParams[index]);
                    }
                });

                // new hash (deeplink) without user params
                hash = location.hash.substring(0, hashParamsMarkerPos) + ((hashParams.length > 0) ? '?' : '') + hashParams.join('&');
            }
        }
    }

    var urlInfo = {
        // Properties
        path: location.origin + location.pathname,
        hash: hash.substr(1),
        // query params, including user params (from query string or deeplink)
        query: queryParams
            .map(function (n) {
                n = n.split('=');
                this[n[0]] = decodeURIComponent(n[1]);
                return this;
            }.bind({}))[0] || {},

        // Methods
        getHashString: function () { return _getHashString(urlInfo); },
        getQueryString: function () { return _getQueryString(urlInfo); }
    };

    return urlInfo;
}

/**
 * Get query string
 * @param urlInfo
 * @returns {string}
 * @private
 */
function _getQueryString(urlInfo) {
    var queryString = '';

    if (urlInfo.query) {
        /*jshint -W089*/ // Body of a for should filter unwanted properties
        for (var key in urlInfo.query) {
            if (!urlInfo.query[key] || urlInfo.query[key] === null) { continue; }

            var query = key + '=' + encodeURIComponent(urlInfo.query[key]);
            queryString += ((queryString.length > 0) ? '&' : '?') + query;
        }
    }

    return queryString;
}

/**
 * Get hash string
 * @param urlInfo
 * @returns {string}
 * @private
 */
function _getHashString(urlInfo) {
    return (_.isString(urlInfo.hash) && urlInfo.hash.length > 0) ? '#' + urlInfo.hash : '';
}

export default routerServiceProvider;
