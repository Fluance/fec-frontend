import template from './fecPatientNavigationButtonAccessLog.component.html';

const PatientNavigationButtonAccessLog = {
    controller: ['$q', '$state', 'dataservice.accessLogs', controller],
    templateUrl: template
};

function controller($q, $state, dataserviceAccessLogs) {
    var ctrl = this;

    // state
    ctrl.isActive = true;

    // methods
    ctrl.$onInit = onInit;
    ctrl.canNavigate = canNavigate;
    ctrl.navigateTo = navigateTo;

    // ------------------------------------------------------ Public functions

    function onInit() {
        if (!_.isBoolean(ctrl.isEnabled)) { ctrl.isEnabled = true; }
        ctrl.requiredContext = 'patientId';
    }

    function canNavigate(context) {
        if (context.patientId) {
            return dataserviceAccessLogs.hasAccessLogData(context.patientId)
                .then(function (hasData) {
                    return hasData;
                });
        } else {
            return $q.resolve(false);
        }
    }

    function navigateTo(context) {
        $state.go('patientAccessLogs', {'pid': context['patientId']});
    }
}

export default PatientNavigationButtonAccessLog;
