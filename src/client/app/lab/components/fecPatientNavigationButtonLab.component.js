import template from './fecPatientNavigationButtonLab.component.html';

const PatientNavigationButtonLab = {
    controller: ['$q', '$state', 'dataservice.lab', controller],
    templateUrl: template
};

function controller($q, $state, dataserviceLab) {
    var ctrl = this;

    // state
    ctrl.isActive = true;
    ctrl.isEnabled = true;

    // methods
    ctrl.$onInit = onInit;
    ctrl.canNavigate = canNavigate;
    ctrl.navigateTo = navigateTo;

    // ------------------------------------------------------ Public functions

    function onInit() {
        ctrl.requiredContext = 'patientId';
    }

    function canNavigate(context) {
        if (context.patientId) {
            // Check if there is any imaging or report for the current patient
            return $q.all([dataserviceLab.hasLabData(context.patientId)
            ]).then(function (results) {
                return (results[0]);
            });
        } else {
            return $q.resolve(false);
        }
    }

    function navigateTo(context) {
        $state.go('labList', {'pid': context['patientId']});
    }
}

export default PatientNavigationButtonLab;
