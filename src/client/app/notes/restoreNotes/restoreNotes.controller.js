// jscs:disable requireParenthesesAroundIIFE

import _ from 'lodash';

RestoreNotesController.$inject = [
    '$scope',
    '$state',
    '$stateParams',
    '$translate',
    '$mdDialog',
    'noteService',
    'dataPager',
    //'LayoutPatientContextBox',
    //'tutorialService',
    'logger',
    'layoutService'
];

function RestoreNotesController($scope, $state, $stateParams, $translate, $mdDialog, noteService, DataPager, logger, layoutService) {
    /*jshint validthis: true */
    var vm = this;
    vm.title = 'RestoreNotesController';

    // Paging
    vm.dataPager = new DataPager();
    vm.dataPager.pageSize = 20;
    vm.dataPager.loadPage = loadPage;

    // Operation methods
    vm.refresh = refresh;
    vm.canSort = function() { return vm.dataPager.items.length > 1; };
    vm.restoreNote = restoreNote;

    vm.patientId = $stateParams.pid || $state.params.pid;
    vm.visitNb = $stateParams.vnb || $state.params.vnb;

    // Events
    $scope.$on('note.stateChanged', _onNoteStateChanged);

    activate();

    // ------------------------------------------------------------------- Interface operations

    function activate() {
        _setScrollableContainerForInfiniteScroll();

        /*
        if (tutorialService.isActive()) {
            // Configure tutorials
            configureTutorial();
            tutorialService.current(vm.title);
        }*/

        // Load view
        refresh();
    }

    function refresh() {
        vm.dataPager.reset();
    }

    function restoreNote(noteId, $event) {
        var confirm;

        $event.stopPropagation();

        // create confirm dialog
        confirm = $mdDialog.confirm()
            .targetEvent($event)
            .title($translate.instant('notes.CONFIRM_RESTORE_TITLE', { noteId: noteId }))
            .textContent($translate.instant('notes.CONFIRM_RESTORE_MSG'))
            .ok($translate.instant('core.YES'))
            .cancel($translate.instant('core.NO'));

        // show confirm dialog
        $mdDialog.show(confirm)
            .then(function() {
                // restore note
                noteService.restoreNote(noteId)
                    .then(function() {
                        // show notification restore success
                        logger.success($translate.instant('notes.SUCCESS_ON_ACTION', { noteId: noteId, ACTION: 'RESTORE' }));

                        // navigate to View Note
                        $state.go('readNote', {
                            noteId: noteId,
                            pid: vm.patientId,
                            vnb: vm.visitNb
                        })
                    })
                    .catch(function(exception) {
                        // TODO: improve workaround
                        if (exception.LockException) {
                            // show notification lock error
                            logger.error($translate.instant('notes.NOTE_IS_LOCKED', { ACTION: 'RESTORE' }));
                        } else {
                            // show notification restore error
                            logger.error($translate.instant('notes.ERROR_ON_ACTION', { ACTION: 'RESTORE' }));
                        }
                    });

            })
            .catch(function() {
                // cancel
            });
    }

    // --------------------------------------------------------------------------- Data loading

    function loadPage(pageIndex, pageSize, sortBy, sortDirection) {
        var offset = pageIndex * pageSize;
        var limit = pageSize;

        loadTotalCount();
        return noteService.getNotesToRestore(vm.patientId, vm.visitNb, offset, limit);
    }

    function loadTotalCount() {
        return noteService.getNotesToRestoreCount(vm.patientId, vm.visitNb)
            .then(function(count) {
                vm.dataPager.setTotalItemsCount(count);
            })
            .catch(function() {
                vm.dataPager.setTotalItemsCount(0);
            });
    }

    // ------------------------------------------------------------------------------- Tutorial

    function configureTutorial() {
        var contextBoxSteps = ContextBox.getTutorialSteps();
        var steps = [{
            element: 'fec-nav-restore',
            introKey: 'notes.GUIDE_RESTORE_NOTE',
            position: 'top-middle-aligned'
        }];
        tutorialService.setSteps(vm.title, 0, contextBoxSteps.concat(steps));
    }

    // ------------------------------------------------------------------------------- Helper methods

    function _onNoteStateChanged(event, args) {
        if (args.isExpanded) {
            _.each(vm.dataPager.items, function(note) {
                if (note.id !== args.noteId) {
                    note.isExpanded = false;
                }
            });
        }
    }

    function _setScrollableContainerForInfiniteScroll() {
        // Scrollable container (relevant for infinite-scroll)
        vm.scrollableContainer = layoutService.getScrollableContainer();
    }

}

export default RestoreNotesController;
