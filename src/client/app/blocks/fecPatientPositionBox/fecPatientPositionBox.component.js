import template from './fecPatientPositionBox.component.html';

const fecPatientPositionBox = {
    bindings: {
        title: '@',
        content: '='
    },
    controller: controller,
    templateUrl: template
};


controller.$inject = [];
function controller() {
    var ctrl = this;
}

export default fecPatientPositionBox;
