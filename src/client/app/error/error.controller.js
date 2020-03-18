import angular from 'angular';
import _ from 'lodash';

ErrorController.$inject = ['$translate', '$q', '$state', 'routerService', 'sessionService'];

/* @ngInject */
function ErrorController($translate, $q, $state, routerService, session) {
    /*jshint validthis: true */
    var vm = this;
    vm.title = 'ErrorController';
    vm.errorMessage = (_.isString($state.params.errorCode)) ? 'error.' + $state.params.errorCode : '';

    init();

    // ------------------------------------------------------

    function init() {
        // On load we resize Login container 'ctnLogin' (where we have Choose your service provider)
        angular.element(document).ready(function () {
            adjustLayout();
        });
        angular.element(window).bind('resize orientationchange', function () {
            adjustLayout();
        });

        // Translate error message
        translateError($state.params.errorCode || 'ERROR', $state.params.errorParams);

        configureNextButton();

        // Needs to be at the end of the state machine! Else the introKey is wrong!
        /*
        if (tutorialService.isActive()) {
            // Configure tutorials
            configureTutorial();
            tutorialService.current(vm.title);
        }
        */
    }

    // When window is resized, resize the Login container 'ctnLogin'
    function adjustLayout() {
        var heightWindow = window.innerHeight;
        var heightNavigationBar = $('nav').outerHeight();

        $('.fec-error-view').height(heightWindow - heightNavigationBar);
    }

    function configureNextButton() {
        /* We need a small state machine since we have more than one outcome for the error procedure
                    ERROR
                      |
                  isLoggedIn? -----y-----
                      |                 |
                      n            canGoBack? -----y-----
                      |                 |               |
              go(serviceDiscovery)      n           go(last)
                                        |
                                    go(logout)
        */
        if (session.isAuthenticated()) {
            // Authenticated
            if ($state.fluanceLastState) {
                vm.next = {
                    label: 'ACTION_BACK',
                    tutorialStep: 'GUIDE_BACK',
                    visible: _visibleAlways,
                    action: _actionGoBack
                };
            } else {
                vm.next = {
                    label: 'ACTION_LOGOUT',
                    tutorialStep: 'GUIDE_LOGOUT',
                    visible: _visibleAlways,
                    action: _actionLogout
                };
            }
        } else {
            // Not authenticated
            switch ($state.params.errorCode) {
                case session.AUTHENTICATION_CHANGED_REASONS.SESSION_TIMEOUT:
                    vm.next = {
                        label: 'ACTION_RELOAD',
                        tutorialStep: 'GUIDE_LOGIN', // ToDo: add constant for tutorial
                        visible: _visibleAlways,
                        action: _actionLogout
                    };
                    break;
                case session.AUTHENTICATION_CHANGED_REASONS.NO_PROFILE:
                    vm.next = {
                        label: 'ACTION_LOGOUT',
                        tutorialStep: 'GUIDE_LOGOUT',
                        visible: _visibleAlways,
                        action: _actionLogout
                    };
                    break;

                default:
                    vm.next = {
                        label: 'ACTION_LOGIN',
                        tutorialStep: 'GUIDE_LOGIN',
                        visible: _visibleIfServiceDiscoveryExists,
                        action: _actionLogout
                    };
                    break;
            }
        }
    }

    function configureTutorial() {
        tutorialService
            .setSteps(vm.title, 0, [{
                element: '#btn-error-nextaction',
                introKey: 'error.' + vm.next.tutorialStep,
                position: 'bottom-middle-aligned'
            }, {
                element: '[tutorial-step="menu"]',
                introKey: 'layout.FEEDBACK_CONTACT_US',
                position: 'right'
            }]);
    }

    function translateError(code, params) {
        var fnTranslate = function (key, params) {
            return $translate(key, params)
                .then(function (value) { return value; })
                .catch(function (value) { return value; });
        };

        var promises = [];

        // Pre-translage message parameters
        if (_.isObject(params)) {
            promises = _.keys(params).map(function (key) {
                return fnTranslate(params[key])
                    .then(function (value) { params[key] = value; });
            });
        }
    }

    // ------------------------------------------------------------------------- Action methods

    function _actionLogout() {
        return session.logout()
            .then(function () {
                $state.go(routerService.defaultRoutingState.name);
            });
    }

    function _actionGoBack() {
        var params = $state.fluanceLastState.params || {};
        $state.go($state.fluanceLastState.state, params);
    }

    // ------------------------------------------------------------------------ Visible methods

    function _visibleAlways() {
        return true;
    }

    function _visibleIfServiceDiscoveryExists() {
        return _.isObject($state.get('serviceDiscovery'));
    }
}

export default ErrorController;
