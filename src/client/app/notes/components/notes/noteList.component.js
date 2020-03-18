import _ from 'lodash';
import template from './noteList.component.html';

const LAYOUT_DEFAULT = 'small',
      MAX_NOTES_COUNT = 5;

const NoteList = {
    bindings: {
        pid: '<',
        vnb: '<',
        noteCategoryId: '<',
        noteItemLayout: '@',
        shiftNotes: '@'
    },
    controller: ['noteService', controller],
    controllerAs: 'vm',
    templateUrl: template
};

function controller(noteService) {
    var vm = this;
    vm.notes = [];

    vm.$onInit = onInit;

    // ------------------------------------------------------------------------- Event handling

    function onInit() {
        vm.isShiftNotes = !_.isUndefined(vm.shiftNotes);

        // Initialize optional parameters
        if (!_.isString(vm.noteItemLayout)) {
            vm.noteItemLayout = LAYOUT_DEFAULT;
        }

        _loadNotes();
    }

    // ------------------------------------------------------------------------- Component methods

    // ------------------------------------------------------------------------- Helper methods

    function _loadNotes() {
        vm.isLoading = true;
        if (vm.pid) {
            noteService
                .getPatientNotes(vm.pid, vm.noteCategoryId, false, 0, MAX_NOTES_COUNT, undefined, vm.isShiftNotes)
                .then(function (notes) {
                    vm.notes = (_.isArray(notes)) ? notes : [];
                    vm.isLoading = false;
                });
        } else if (vm.vnb) {
            noteService
                .getVisitNotes(vm.vnb, vm.noteCategoryId, false, 0, MAX_NOTES_COUNT, undefined, vm.isShiftNotes)
                .then(function (notes) {
                    vm.notes = (_.isArray(notes)) ? notes : [];
                    vm.isLoading = false;
                });
        }
    }
}

export default NoteList;
