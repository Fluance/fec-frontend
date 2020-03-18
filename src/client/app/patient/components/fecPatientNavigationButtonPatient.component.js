import template from './fecPatientNavigationButtonPatient.component.html';

const PatientNavigationButtonPatient = {
    controller: ['$q', '$state', 'dataservice.patients', controller],
    templateUrl: template
};

function controller($q, $state, dataservicePatients) {
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
            return dataservicePatients.getPatientByPid(context.patientId).then(function (patient) {

                if (patient && patient.patient) {
                    ctrl.patient = patient.patient;
                    ctrl.gender = patient.patient.sex;
                    return true;
                } else {
                    return false;
                }

            });
        } else {
            return $q.resolve(false);
        }
    }

    function navigateTo(context) {
        $state.go('patient', {'pid': context['patientId']});
    }
}

export default PatientNavigationButtonPatient;
