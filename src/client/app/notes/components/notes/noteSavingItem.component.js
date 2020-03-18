import template from './noteSavingItem.component.html';

const NoteSavingItem = {
    bindings: {
        item: '<'
    },
    controller: [controller],
    controllerAs: 'vm',
    templateUrl: template
};

function controller() {
    var ctrl = this;

    ctrl.showImage = false;

    // events
    ctrl.$onInit = onInit;

    // -------------------------------------------- Event methods

    function onInit() {
        ctrl.isNote = (ctrl.item.data.constructor.name === 'Note');
        ctrl.isPicture = (ctrl.item.data.constructor.name === 'Picture');
    }
}

export default NoteSavingItem;
