import template from './fecAnesthesiaBox.component.html';

const fecAnesthesiaBox = {
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

export default fecAnesthesiaBox;
