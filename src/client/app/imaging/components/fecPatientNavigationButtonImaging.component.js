import template from './fecPatientNavigationButtonImaging.component.html';

const PatientNavigationButtonImaging = {
    controller: ['$q', '$state', 'dataservice.imaging', controller],
    templateUrl: template
};

function controller($q, $state, dataServiceImaging) {

    var ctrl = this;

    // state
    ctrl.isActive = true;

    // methods
    ctrl.$onInit = onInit;
    ctrl.canNavigate = canNavigate;
    ctrl.navigateTo = navigateTo;

    // ------------------------------------------------------ Public functions

    function onInit() {
        if (!_.isBoolean(ctrl.isEnabled)) {
            ctrl.isEnabled = true;
        }
        ctrl.requiredContext = 'patientId';
    }

    function canNavigate(context) {
        if (context.patientId) {
            // Check if there is any imaging or report for the current patient
            return $q.all([
                dataServiceImaging.hasImagingData(context.patientId),
                dataServiceImaging.hasReportData(context.patientId)
            ]).then(function (results) {
                return (results[0] || results[1]);
            });
        } else {
            return $q.resolve(false);
        }
    }

    function navigateTo(context) {
        $state.go('imagingList', {'pid': context['patientId']});
    }
}

export default PatientNavigationButtonImaging;
