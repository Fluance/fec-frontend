import template from './fecPatientVisitAdmission.component.html';

const PatientVisitAdmission = {
    bindings: {
        visit: '<'
    },
    controller: [controller],
    templateUrl: template
};

function controller() {}

export default PatientVisitAdmission;
