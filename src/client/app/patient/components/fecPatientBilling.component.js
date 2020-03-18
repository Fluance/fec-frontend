import template from './fecPatientBilling.component.html';

const PatientBilling = {
    bindings: {
        billingContacts: '<'
    },
    controller: [controller],
    templateUrl: template
};

function controller() {}

export default PatientBilling;
