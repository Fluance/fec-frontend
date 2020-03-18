import _ from 'lodash';
import template from './noteReadCounter.component.html';

const NoteReadCounter = {
    bindings: {
        categoryId: '<',
        patientId: '<',
        visitNb: '<',
        shiftNotes: '@'
    },
    controller: ['$q', 'dataservice.notes', 'noteService', controller],
    controllerAs: 'vm',
    templateUrl: template
};

function controller($q, dataserviceNotes, noteService) {
    var vm = this;
    var isShiftNotes;

    vm.unreadNotesCounter = 0;
    vm.notesCounter = 0;

    vm.$onInit = onInit;
    vm.$onDestroy = onDestroy;

    // ------------------------------------------------------------------------- Event handling

    function onInit() {
        isShiftNotes = !_.isUndefined(vm.shiftNotes);

        _countUnreadNotes();
        _countNotes();
        noteService.multipleNotesChangedEvent.subscribe(_onChangedEvent);
        noteService.singleNoteChangedEvent.subscribe(_onChangedEvent);
    }

    function onDestroy() {
        noteService.multipleNotesChangedEvent.unsubscribe(_onChangedEvent);
        noteService.singleNoteChangedEvent.unsubscribe(_onChangedEvent);
    }

    function _onChangedEvent() {
        _countUnreadNotes();
        _countNotes();
    }

    // ------------------------------------------------------------------------- Helper methods

    function _countNotes() {
        noteService.getNotesCount(vm.patientId, vm.visitNb, vm.categoryId, false, undefined, isShiftNotes).then(function(counter) {
            vm.notesCounter = counter;
        });
    }

    function _countUnreadNotes() {
        noteService.getNotesCount(vm.patientId, vm.visitNb, vm.categoryId, false, false, isShiftNotes).then(function(counter) {
            vm.unreadNotesCounter = counter;
        });
    }
}

export default NoteReadCounter;
