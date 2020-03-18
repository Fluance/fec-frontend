// jscs:disable requireParenthesesAroundIIFE


NoteController.$inject = ['$stateParams', '$q', 'dataservice.notes',
    'dataservice.locks', '$translate', 'logger', '$filter', '$state'
];

/* @ngInject */
function NoteController($stateParams, $q, dataserviceNotes, dataserviceLocks,
    $translate, logger, $filter, $state) {

    /*jshint validthis: true */
    var vm = this;
    vm.title = 'Note Controller';
    vm.mode = '';
    vm.onClose = onClose;

    switch ($state.current.name) {
        case 'readNote':
            vm.mode = 'view';
            break;
        case 'editNote':
            vm.mode = 'edit';
            break;
        case 'newNote':
            vm.mode = 'new';
            break;
    }

    vm.noteId = $stateParams.noteId;
    vm.patientId = $stateParams.pid || $state.params.pid;
    vm.visitNb = $stateParams.vnb || $state.params.vnb;
    vm.categoryId = $stateParams.categoryId || $state.params.categoryId;
    vm.isShiftNote = ($stateParams.shift === 'true' || $state.params.shift === 'true');

    activate();

    function onClose(isSaved, isNew, isDeleted) {
        if (isDeleted || isNew) {
            if (vm.patientId) {
                $state.go('noteCategories', { pid: vm.patientId });
            } else if (vm.visitNb) {
                $state.go('visit', { vnb: vm.visitNb });
            }
        } else if (vm.noteId) {
            if ($state.fluanceSecondLastState != undefined) {
                $state.go($state.fluanceSecondLastState.state.name, $state.fluanceSecondLastState.params);
            } else {
                $state.go('readNote', { pid: vm.patientId, vnb: vm.visitNb, noteId: vm.noteId });
            }
        }
    }

    function activate() {
        /*
        if (tutorialService.isActive()) {
            // Configure tutorials
            configureTutorial();
        }*/
    }

    // _________TUTORIAL

    function configureTutorial() {
        tutorialService.current(vm.title);
        var contextBoxSteps = ContextBox.getTutorialSteps();

        if ($state.current.name === 'readNote') {

            var steps = [{
                element: 'fec-nav-read-status',
                introKey: 'notes.GUIDE_NOTE_STATUS',
                position: 'bottom-right-aligned'
            }, {
                element: 'fec-nav-history',
                introKey: 'notes.GUIDE_HISTORY_BUTTON',
                position: 'bottom-right-aligned'
            }, {
                element: 'fec-nav-delete',
                introKey: 'notes.GUIDE_NOTE_DELETE',
                position: 'top-middle-aligned'
            }, {
                element: 'fec-nav-edit',
                introKey: 'notes.GUIDE_NOTE_EDIT',
                position: 'top-middle-aligned'
            }];
            // tutorialService.setSteps(vm.title, 0, contextBoxSteps.concat(steps));
        }

        if ($state.current.name === 'newNote' || $state.current.name === 'editNote') {

            var steps = [{
                element: 'fec-shift-note',
                introKey: 'notes.GUIDE_SHIFT_NOTE',
                position: 'bottom-right-aligned'
            }, {
                element: 'fec-nav-ref-date',
                introKey: 'notes.GUIDE_REF_DATE',
                position: 'top-middle-aligned'
            }, {
                element: 'fec-nav-time',
                introKey: 'notes.GUIDE_REF_TIME',
                position: 'top-middle-aligned'
            }, {
                element: 'fec-nav-category',
                introKey: 'notes.GUIDE_CATEGORY',
                position: 'top-middle-aligned'
            }, {
                element: 'fec-nav-title',
                introKey: 'notes.GUIDE_TITLE',
                position: 'top-middle-aligned'
            }, {
                element: 'fec-nav-description',
                introKey: 'notes.GUIDE_DESCRIPTION',
                position: 'top-middle-aligned'
            }, {
                element: 'fec-note-picture-list',
                introKey: 'notes.GUIDE_EDIT_MODE',
                position: 'top-middle-aligned'
            }, {
                element: 'fec-nav-cancel',
                introKey: 'notes.GUIDE_NOTE_CANCEL',
                position: 'top-middle-aligned'
            }, {
                element: 'fec-nav-save',
                introKey: 'notes.GUIDE_NOTE_EDIT',
                position: 'top-middle-aligned'
            }];
            // tutorialService.setSteps(vm.title, 0, contextBoxSteps.concat(steps));
        }

        tutorialService.setSteps(vm.title, 0, contextBoxSteps.concat(steps));
    }
}

export default NoteController;
