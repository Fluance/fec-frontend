import template from './notesAndPicturesSummary.component.html';

const NotesAndPicturesSummary = {
    bindings: {
        pid: '<',
        vnb: '<'
    },
    controller: ['noteService', controller],
    templateUrl: template
};

function controller(noteService) {
    var vm = this;

    vm.isActive = true;

    // Remove tag, if N&P components are not activated
    if(!noteService.isActive()) {
        vm.isActive = false
    }
}

export default NotesAndPicturesSummary;
