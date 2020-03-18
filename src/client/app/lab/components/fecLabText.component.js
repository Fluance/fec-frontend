import template from './fecLabText.component.html';

const LabText = {
    templateUrl: template,
    controller: controller,
    bindings: {
        textData: '<'
    }
};

controller.$inject = [];

function controller() {
    /*jshint validthis: true */
    var ctrl = this;
}

export default LabText;
