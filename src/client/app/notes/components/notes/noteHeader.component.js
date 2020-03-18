import _ from 'lodash';
import template from './noteHeader.component.html';

const NoteHeader = {
    bindings: {
        note: '<',
        showReadStatus: '<'
    },
    controller: [controller],
    controllerAs: 'vm',
    templateUrl: template
};

function controller() {
    var vm = this;

    // events
    vm.$onInit = onInit;

    // -------------------------------------- Event methods

    function onInit() {
        vm.showReadStatus = _.isUndefined(vm.showReadStatus) ? true : vm.showReadStatus;
    }
}

export default NoteHeader;
