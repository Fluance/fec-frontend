import template from './navButtonNotes.component.html';

const NavButtonNotes = {
    bindings: {
        pid: '<',
        vnb: '<',
        isEnabled: '<?'
    },
    controller: controller,
    controllerAs: 'vm',
    templateUrl: template
};

controller.$inject = [
    '$element',
    'noteService'
];

function controller($element, noteService) {
    var ctrl = this;

    //value to test if there are notes
    ctrl.hasNotes = false;

    // Remove tag, if N&P components are not activated
    if (!noteService.isActive()) {
        $element.remove();
    }
    else {
        ctrl.$onInit = onInit;
    }

    // ------------------------------ Events

    function onInit() {
        //get notes for patient or patient and visit
        noteService
            .getNotesToRestoreCount(ctrl.pid, ctrl.vnb)
            .then(function(notesCounter) {
                ctrl.hasNotes = (notesCounter > 0);
            });
    }
}

export default NavButtonNotes;
