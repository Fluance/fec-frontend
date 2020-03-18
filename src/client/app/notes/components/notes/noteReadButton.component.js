import _ from 'lodash';
import template from './noteReadButton.component.html';

const NoteReadButton = {
    bindings: {
        noteId: '<',
        categoryId: '<',
        patientId: '<',
        visitNb: '<',
        color: '@',
        isRead: '=',
        showOption: '<',
        shiftNotes: '@',
        ownCreator: '=',
        unreadRecords: '=',
        canResize: '=',
        size: '@'
    },
    controller: ['$q', '$scope', 'dataservice.notes', 'noteService', 'sessionService', controller],
    controllerAs: 'vm',
    templateUrl: template
};

function controller($q, $scope, dataserviceNotes, noteService, sessionService) {
    var vm = this;
    var originatorEv, isShiftNotes;

    $scope.$watch('vm.categoryId', function (oldValue, newValue) {
        if (oldValue !== newValue) {
            _countUnreadNotes();
        }
    });

    $scope.$watch('vm.ownCreator', function (oldValue, newValue) {
        if (oldValue !== newValue) {
            _countUnreadNotes();
        }
    });

    vm.unreadNotesCounter = 0;

    vm.getMarkAllAsReadLabel = getMarkAllAsReadLabel;
    vm.getMarkAsReadLabel = getMarkAsReadLabel;
    vm.openMenu = openMenu;
    vm.toggleRead = toggleRead;
    vm.toggleReadAll = toggleReadAll;

    vm.$onInit = onInit;
    vm.$onDestroy = onDestroy;

    // ------------------------------------------------------------------------- Event handling

    function getMarkAllAsReadLabel() {
        return vm.unreadNotesCounter >= 1 ? 'notes.READ_ALL' : 'notes.UNREAD_ALL';
    }

    function getMarkAsReadLabel() {
        return vm.isRead ? 'notes.MARK_AS_UNREAD' : 'notes.MARK_AS_READ';
    }

    function openMenu($mdMenu, ev) {
        originatorEv = ev;
        $mdMenu.open(ev);
    }

    function onInit() {
        isShiftNotes = !_.isUndefined(vm.shiftNotes);

        if (vm.noteId) {
            noteService.multipleNotesChangedEvent.subscribe(_onMultipleNotesChangedEvent);
        } else if (vm.patientId && (vm.categoryId || isShiftNotes)) {
            _countUnreadNotes();
            noteService.singleNoteChangedEvent.subscribe(_onSingleNoteChangedEvent);
        }
    }

    function onDestroy() {
        if (vm.noteId) {
            noteService.multipleNotesChangedEvent.unsubscribe(_onMultipleNotesChangedEvent);
        } else if (vm.patientId && vm.categoryId) {
            noteService.singleNoteChangedEvent.unsubscribe(_onSingleNoteChangedEvent);
        }
    }

    function toggleRead() {
        noteService.setNoteRead(vm.noteId, !vm.isRead).then(function (data) {
            if (!_.isUndefined(vm.unreadRecords)) {
                if (vm.isRead) {
                    vm.unreadRecords++
                } else {
                    vm.unreadRecords--
                }
            }
            vm.isRead = !vm.isRead;
        });
    }

    function toggleReadAll() {
        var creator;
        if (vm.ownCreator) {
            creator = sessionService.user.domain + '/' + sessionService.user.username;
        }
        noteService.setNoteReadAll(vm.patientId, vm.visitNb, vm.categoryId, (vm.unreadNotesCounter >= 1), isShiftNotes, creator).then(function () {
            _countUnreadNotes();
        });
    }

    function _onSingleNoteChangedEvent() {
        _countUnreadNotes();
    }

    function _onMultipleNotesChangedEvent(args) {
        if (vm.isRead !== args.readState && vm.categoryId === args.categoryId) {
            vm.isRead = args.readState;
        }
    }

    // ------------------------------------------------------------------------- Helper methods

    function _countUnreadNotes() {
        var creator;
        if (vm.ownCreator) {
            creator = sessionService.user.domain + '/' + sessionService.user.username;
        }
        noteService.getNotesCount(vm.patientId, vm.visitNb, vm.categoryId, false, false, isShiftNotes, creator).then(function (counter) {
            vm.unreadNotesCounter = counter;
        });
    }
}

export default NoteReadButton;
