import template from './fecPatientAddress.component.html';

const PatientAddress = {
    bindings: {
        maritalStatus: '<',
        patientAddress: '<',
        patientInfo: '<'
    },
    controller: [controller],
    templateUrl: template
};

function controller() {}

export default PatientAddress;
