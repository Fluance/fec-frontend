import _ from 'lodash';
import template from './fecPatientNavigationButtonNotes.component.html';

const PatientNavigationButtonNotes = {
    controller: [
        '$q',
        '$state',
        '$translate',
        'dataservice.notes',
        controller],
    templateUrl: template
};

function controller(
    $q,
    $state,
    $translate,
    dataserviceNotes) {

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
        return true;
    }

    function navigateTo(context) {
        $state.go('noteCategories', { 'pid': context['patientId'] });
    }
}

export default PatientNavigationButtonNotes;
