import template from './virtual-datatable-body.component.html';

const virtualDatatableBody = {
    bindings: {
        dynamicItems: '<',
        options: '<',
        isScrolling: '<'
    },
    controller: [controller],
    templateUrl: template
};

function controller() {
    var ctrl = this;
}


export default virtualDatatableBody;
