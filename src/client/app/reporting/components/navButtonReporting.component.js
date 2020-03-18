// jscs:disable requireParenthesesAroundIIFE

import _ from 'lodash';

/**
 * @ngdoc directive
 * @module reporting
 * @name fecNavButtonReporting
 * @description
 *
 * The Reporting navigation button allows deep-link navigation to Reporting for patients and visits.
 * <ul>
 * <li>The button is only visible if Reporting components are activated by the reportingService.</li>
 * <li>The button is enabled when the user is allowed access to Reporting data for the selected company.</li>
 * </ul>
 */
const NavButtonReporting = {
    bindings: {
        pid: '<', // Only used for access logging
        contextId: '<',
        contextName: '<',
        isEnabled: '<'
    },
    controller: controller,
    template: '<md-button ng-if="$ctrl.isActive" class ="md-primary" ng-disabled="!$ctrl.canNavigateResult" fec-mobile-click="$ctrl.navigateTo()">{{ "reporting.REPORTING_BUTTON_LABEL" | translate }}<md-progress-linear md-mode="indeterminate" ng-show="$ctrl.isBusy"></md-progress-linear></md-button>'
};

controller.$inject = [
    '$window',
    '$q',
    '$translate',
    'dataservice.accessLogs',
    'logger',
    'reportingService',
    'TabOpenerService'
];

function controller($window, $q, $translate, dataserviceAccessLog, logger, reportingService, tabOpener) {
    /*jshint validthis: true */
    var vm = this;

    vm.isBusy = false;
    vm.canNavigateResult = false;
    vm.isActive = true;

    //vm.isEnabled = _isEnabled;
    vm.navigateTo = navigateTo;

    vm.$onInit = onInit;
    vm.$onChanges = onChanges;

    // ------------------------------------------------------------------------ Lifecycle-hooks

    function onInit() {
        // Remove tag, if Reporting components are not activated
        if (!reportingService.isActive()) {
            vm.isActive = false;
        } else {
            if (!_.isBoolean(vm.isEnabled)) { vm.isEnabled = true; }
            canNavigate();
        }
    }


    function onChanges(changesObj) {
        // $onChanges runs before $onInit. Skip first run.
        if (!changesObj.isEnabled || changesObj.isEnabled.isFirstChange()) { return; }

        if (changesObj.isEnabled) {
            canNavigate();
        }
    }

    // ------------------------------------------------------------------------- Public methods

    // Temporarily disable Reporting button (FEHC-2254)
    function canNavigate() {
        vm.canNavigateResult = false;
    }

    function _canNavigate() {
        // is button enabled ?
        if (vm.isEnabled !== true) { return; }

        vm.isBusy = true;
        // verify access
        _canAccess()
            .then(function(canAccess) {
                if (!canAccess) {
                    throw new Error('User does not have access to Reporting');
                }
            })
            .then(function() {
                // get URL
                return reportingService.getDeepLink(vm.contextName, vm.contextId)
            })
            .then(function(url) {
                vm.url = url;
                vm.canNavigateResult = true;
            })
            .catch(function(error) {
                //logger.error(error);

                vm.canNavigateResult = false;
            })
            .finally(function() {
                vm.isBusy = false;
            });
    }

    function navigateTo() {
        // Log access
        var vnb = (vm.contextName === reportingService.CONTEXT_VISIT) ? vm.contextId : undefined;
        dataserviceAccessLog.writeLog(vm.pid, dataserviceAccessLog.OBJECT_TYPE_REPORTING, vnb);

        // open reporting in new tab
        $window.location.href = vm.url;
    }

    // ------------------------------------------------------------------------- Helper methods

    function _canAccess() {
        return _checkAccess()
            .then(function(hasAccess) {
                var isInternalAccessor = reportingService.isInternalAccessor();
                return hasAccess && isInternalAccessor;
            })
    }

    function _checkAccess() {
        // don't validate if user has access to selected company
        return $q.resolve(true);
    }
}

export default NavButtonReporting;
