import template from './fecPatientContact.component.html';

const PatientContact = {
    bindings: {
        patientContacts: '<'
    },
    controller: [controller],
    templateUrl: template
};

function controller() {}

export default PatientContact;
