// jscs:disable requireParenthesesAroundIIFE
import template from './fluancePatientListItem.component.html';

const fluancePatientListItem = {
    bindings: {},
    controller: controller,
    templateUrl: template,
    transclude: {
        pid: '?patientPid',
        lastname: '?patientLastname',
        firstname: '?patientFirstname',
        sex: '?patientSex',
        birthdate: '?patientBirthdate',
        address: '?patientAddress'
    }
};

controller.$inject = [];

function controller() {
    /*jshint validthis: true */
    var ctrl = this;
}

export default fluancePatientListItem;


