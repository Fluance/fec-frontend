import template from './myPatientDoctorsAppActions.component.html';

const MyPatientDoctorsAppActions = {
    templateUrl: template,
    controller: controller,
    bindings: {
        pid: '<'
    }
};

function controller() {
    var ctrl = this;
}

export default MyPatientDoctorsAppActions;
