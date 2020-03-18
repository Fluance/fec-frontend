import _ from 'lodash';
import template from './fecPatientNavigationButtonReporting.component.html';

const PatientNavigationButtonReporting = {
    bindings: {
        contextId: '<',
        contextName: '<',
        isEnabled: '<?'
    },
    controller: ['$q', '$scope', '$window', '$translate', 'config', 'dataservice.accessLogs', 'reportingService', controller],
    templateUrl: template
};

function controller($q, $scope, $window, $translate, config, dataserviceAccessLog, reportingService) {
    var ctrl = this;

    var PATIENT_CONTEXT = 'patient';
    var VISIT_CONTEXT = 'visit';

    // state
    ctrl.isBusy = false;
    ctrl.canNavigateResult = false;
    ctrl.isActive = true;

    // methods
    ctrl.$onInit = onInit;
    ctrl.canNavigate = canNavigate;
    ctrl.navigateTo = navigateTo;

    // ------------------------------------------------------ Public functions

    function onInit() {
        if (!_.isBoolean(ctrl.isEnabled)) { ctrl.isEnabled = true; }

        // Remove tag, if Reporting components are not activated
        if (!reportingService.isActive()) {
            ctrl.isActive = false;
            ctrl.isEnabled = false;
        } else {
            //_canNavigate();

            // set Patient context name
            if(!_.isString(ctrl.contextName)) { ctrl.contextName = PATIENT_CONTEXT; }

            // define required navigation context
            if(ctrl.contextName === VISIT_CONTEXT) {
                ctrl.requiredNavigationContext = 'visitId';
            }
            else {
                ctrl.requiredNavigationContext = 'patientId';
            }
        }
    }

    // ------------------------------------------------------------------------- Public methods

    function canNavigate(navigationContext) {
        var defer;

        if(config.reporting && config.reporting.forceButtonDisabled) {
            ctrl.canNavigateResult = false;
            return $q.resolve(false);
        }

        // is button enabled ?
        if (ctrl.isEnabled !== true) { return $q.reject(false); }

        defer = $q.defer();

        ctrl.isBusy = true;
        // verify access
        _canAccess()
            .then(function(canAccess) {
                if (!canAccess) {
                    throw new Error('User does not have access to Reporting');
                }
            })
            .then(function() {
                // get URL
                switch(ctrl.contextName) {
                    case reportingService.CONTEXT_PATIENT:
                            ctrl.requiredNavigationContext = 'patientId';
                            ctrl.contextId = navigationContext.patientId;
                            break;
                    case reportingService.CONTEXT_VISIT:
                            ctrl.requiredNavigationContext = 'visitId';
                            ctrl.contextId = navigationContext.visitId;
                            break;
                }
            })
            .then(function() {
                ctrl.canNavigateResult = true;
            })
            .catch(function(error) {
                ctrl.canNavigateResult = false;
            })
            .finally(function() {
                ctrl.isBusy = false;
                defer.resolve(ctrl.canNavigateResult);
            });

        return defer;
    }

    function navigateTo(navigationContext) {
        if(ctrl.contextId) {
            // get url based on contextName (eg: patient, visit)
            reportingService.getDeepLink(ctrl.contextName, ctrl.contextId)
            .then((url) => {
                // Log access
                var vnb = (ctrl.contextName === reportingService.CONTEXT_VISIT) ? navigationContext.visitId : undefined;
                dataserviceAccessLog.writeLog(navigationContext.patientId, dataserviceAccessLog.OBJECT_TYPE_REPORTING, vnb);

                // open reporting in new tab
                $window.location.href = url;
            });
        }
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

export default PatientNavigationButtonReporting;
