import _ from 'lodash';
import template from './noteReadStatus.component.html';

const NoteReadStatus = {
    bindings: {
        noteId: '<',
        categoryId: '<',
        patientId: '<',
        isRead: '=',
        readFlag: '<',
        filterUnread: '=',
        isShift: '=',
        creator: '='
    },
    controller: ['$q', 'dataservice.notes', 'noteService', 'sessionService', controller],
    controllerAs: 'vm',
    templateUrl: template
};

function controller($q, dataserviceNotes, noteService, sessionService) {
    var vm = this;

    vm.$onInit = onInit;
    vm.$onDestroy = onDestroy;

    // ------------------------------------------------------------------------- Event handling

    function onInit() {
        // Initialize optional parameters
        noteService.multipleNotesChangedEvent.subscribe(_onMultipleNotesChangedEvent);
    }

    function onDestroy() {
        // Initialize optional parameters
        noteService.multipleNotesChangedEvent.unsubscribe(_onMultipleNotesChangedEvent);
    }

    function _onMultipleNotesChangedEvent(args) {
        if (vm.isRead !== undefined) {
            if (vm.isRead !== args.readState && ((_.isNaN(args.categoryId) && vm.isShift) || vm.categoryId === args.categoryId) && args.shift === vm.isShift && (_.isUndefined(args.creator) || vm.creator === args.creator)) {
                vm.isRead = args.readState;
            }
        }
    }
}

export default NoteReadStatus;
