import angular from 'angular';
import _ from 'lodash';
import template from './note.component.html';

const MODE_EDIT = 'edit',
      MODE_NEW = 'new',
      MODE_VIEW = 'view',
      MODE_DEFAULT = MODE_VIEW;

const LOCK_RESOURCE_TYPE = 'Note';

const TASK_NAME_CREATE_NOTE = 'createNote',
      TASK_NAME_UPDATE_NOTE = 'updateNote',
      PIPELINE_NAME = "pipeline-save-note";

const config = ['ngWigToolbarProvider', noteConfig];
const Note = {
    bindings: {
        mode: '@',
        isShiftNote: '<',
        patientId: '<',
        categoryId: '<',
        noteId: '<',
        visitNb: '<',
        onClose: '&'
    },
    controller: ['$timeout', '$mdDialog', '$q', '$translate', '$filter', 'dataservice.notecategories',
        'dataservice.notes', 'dataservice.locks', 'dataservice.pictures', 'logger', 'PictureService',
        'CheckListService', 'AsyncPipelineBuilderService', 'NoteSavingDialogService', 'userAgentService',
        'sessionService', 'config', controller
    ],
    templateUrl: template
};

function noteConfig(ngWigToolbarProvider) {
    ngWigToolbarProvider.addStandardButton('underline', 'Underline', 'underline', 'fa-underline');
}

function controller($timeout, $mdDialog, $q, $translate, $filter, dataserviceNoteCategories,
                    dataserviceNotes, dataserviceLocks, dataserviceNotePictures, logger, pictureService,
                    checkListService, asyncPipelineBuilder, NoteSavingDialogService, userAgentService,
                    session, config) {
    var ctrl = this;

    // Properties
    ctrl.isLocked = false; // indicates if note has been locked by another user
    ctrl.note = {};
    ctrl.notePictures;
    ctrl.noteForm = {};
    ctrl.noteModified = false;
    ctrl.isEmpty = false;
    ctrl.isCrashed = false;

    ctrl.noteSavingPipelineBlueprint; // blueprint for creating the note saving pipeline
    ctrl.noteSavingPipelineFlow;      // dynamic representation of the note saving pipeline

    // Methods
    ctrl.cancel = cancel;
    ctrl.isMode = isMode;
    ctrl.getCategoryId = getCategoryId;
    ctrl.saveNote = saveNote;
    ctrl.deleteNote = deleteNote;
    ctrl.uploadPicture = uploadPicture;
    ctrl.onChange = onChange;
    ctrl.isMobileSize = userAgentService.isMobileSize;
    ctrl.editionEnabled = editionEnabled;

    // Events
    ctrl.$onInit = onInit;

    // ------------------------------------------------------------------------- Event handling

    function onInit() {
        // Initialize optional parameters
        if (!_.isString(ctrl.mode)) { ctrl.mode = MODE_DEFAULT; }

        // Set date locale
        moment().locale(['de-CH']);

        _configureEditor();
        _setNote(); // set note model
        _loadCategories(); // MKA: Is this not only required in edit-mode?
    }

    // ------------------------------------------------------------------------- Public methods
    function editionEnabled() {
        return !session.user.hasRole(config.accessControl.navigationComponents.fecNote.editonDisabledForRoles);
    }

    function cancel() {
        var confirm;

        // create confirm dialog
        confirm = $mdDialog.confirm()
            .textContent($translate.instant('notes.CONFIRM_CANCEL'))
            .ok($translate.instant('core.YES'))
            .cancel($translate.instant('core.NO'));

        if (ctrl.noteModified) {
            // show confirm dialog
            $mdDialog.show(confirm)
                .then(function () {
                    _unlockNote();
                })
                .then(function () {
                    _onClose(false, false);
                })
                .catch(function() {
                    // cancel
                });
        } else {
            _unlockNote()
                .then(function () {
                    _onClose(false, false);
                });
        }
    }

    function isMode(mode) {
        return ctrl.mode === mode;
    }

    function getCategoryId() {
        return ctrl.note && ctrl.note.category ? ctrl.note.category.id : ctrl.categoryId;
    }

    /**
     * Save note and pictures.
     * The function handles new or existing note, as well as new or existing pictures. It also handles
     * the locking/unlocking of the note (existing or new)
     *
     * NOTES:
     * 1) When _saving_ a note mode == MODE_NEW or MODE_EDIT.
     * if MODE_EDIT, note is expected to have been locked.
     *
     * 2) With the concept of the pipeline, saving note and pictures can handle failed operations, and
     * re-try processing them. In this way, operations that are not dependant, are not blocked by others. eg: updating
     * a note and processing pictures.
     *
     * Pre-Step:
     * 0. When loading note, if mode == MODE_EDIT => lock note.
     *
     * Steps:
     *
     * 1. Save note: update existing/create new note (if it's new note, dataservice must set note id)
     * 2. If it's new, lock note (required by MW API for saving pictures)
     * 3. Process picture(s): create/update/delete/restore pictures
     * 4. Check all operations involved completed successfully.
     *
     *    YES:
     *
     * 4. Unlock note
     * 5. Call onClose() function
     *
     *    NO:
     *
     *    Re-try saving note, skipping all operations that completed successfully.
     *
     * @returns {*}
     */
    function saveNote() {
        var isNewNote = ctrl.note.id ? false : true;

        // open saving dialog
        NoteSavingDialogService.openDialog(_onContinueSaveNote, _onCancelNoteSavingDialog);

        // process note (and pictures)
        if (isNewNote) {
            _createNote();
        }
        else {
            _updateNote();
        }

    }

    function deleteNote($event) {
        var confirm;

        // create confirm dialog
        confirm = $mdDialog.confirm()
            .title($translate.instant('notes.CONFIRM_DELETE_NOTE_TITLE', { noteId: ctrl.note.id }))
            .textContent($translate.instant('notes.CONFIRM_DELETE_NOTE'))
            .ok($translate.instant('core.YES'))
            .cancel($translate.instant('core.NO'));

        // show confirm dialog
        $mdDialog.show(confirm)
            .then(function () {
                // delete note
                return _lockNote()
                    .then(function () {
                        return dataserviceNotes
                            .deleteNote(ctrl.noteId);
                    })
                    .then(function () {
                        // Unlock existing note after successfull delete
                        return _unlockNote();
                    })
                    .then(function () {
                        // show notification delete success
                        logger.success($translate.instant('core.OPERATION_SUCCESSFUL'));
                        ctrl.note.id = undefined;
                        _onClose(true, true);
                    })
                    .catch(function (exception) {
                        // TODO: improve workaround
                        if (exception.LockException) {
                            // show notification lock error
                            logger.error($translate.instant('notes.NOTE_IS_LOCKED', { ACTION: 'DELETE' }));
                        } else {
                            // show notification delete error
                            logger.error($translate.instant('notes.ERROR_ON_ACTION', { ACTION: 'DELETE' }));
                        }

                        ctrl.mode = MODE_DEFAULT;
                    });
            })
            .catch(function() {
                // cancel
            });
    }

    function uploadPicture(file) {
        if (file === null) { return; }

        return dataserviceNotePictures
            .uploadPicture(ctrl.noteId, file)
            .catch(function (exception) {
                logger.error('Error while uploading a picture.', exception);
            });
    }

    /**
     * Called whenever note is modified
     */
    function onChange() {
        // mark note as modified
        ctrl.noteModified = true;
        ctrl.noteForm.$dirty = true;

        // don't need to extend lock when it's new note
        if (ctrl.nodeId) {
            // extend lock period
            _lockNote();
        }
    }

    // ---------------------------------------------------------------------- Edit mode methods

    function _configureEditor() {
        if (isMode(MODE_EDIT) || isMode(MODE_NEW)) {
            ctrl.editorButtons = 'bold,italic,underline';
        }
    }

    /**
     * Tries to obtain lock for a note.
     * Normally. a lock is requested before updating or deleting an existing note.
     * However, when creating a new note, it must be locked before adding pictures to it.
     * @returns {*}
     * @private
     */
    function _lockNote() {
        return dataserviceLocks
            .lock(ctrl.noteId, LOCK_RESOURCE_TYPE)
            .then(function (data) {
                ctrl.isLocked = false;
            }).catch(function (reason) {
                ctrl.isLocked = true;
            });
    }

    function _unlockNote() {
        return dataserviceLocks
            .unlock(ctrl.noteId, LOCK_RESOURCE_TYPE)
            .then(function (data) {
                ctrl.isLocked = false;
            }).catch(function (reason) {
                ctrl.isLocked = true;
            });
    }

    // ---------------------------------------------------------------------- Helper methods

    function _loadCategories() {
        dataserviceNoteCategories
            .getNoteCategories()
            .then(function (categories) {
                ctrl.categories = categories;
            });
    }

    /**
     * Set note data to display.
     * Load data if note exists, otherwise create new instance
     * @private
     */
    function _setNote() {
        // get new instance
        if (isMode(MODE_NEW)) {
            _newInstanceNote();
        }
        // load existing note
        else {
            _loadNote().then(function () {
                // MDP-DATE-PICKER / MDP-TIME-PICKER workaround (required field)
                if (ctrl.noteForm && ctrl.noteForm.referenceDate && ctrl.noteForm.referenceTime) {
                    ctrl.noteForm.referenceDate.$viewValue = $filter('formatDate')(ctrl.note.referenceDate, 'date');
                    ctrl.noteForm.referenceTime.$viewValue = $filter('formatDate')(ctrl.note.referenceDate, 'time');
                }

                if(ctrl.isMode(MODE_VIEW) && !ctrl.note.read) {
                    dataserviceNotes.setNoteRead(ctrl.note.id, !ctrl.note.read).then(function () {
                        ctrl.note.read = true;
                    });
                }
            });

            // lock note
            if (isMode(MODE_EDIT)) {
                _lockNote();
            }
        }
    }

    /**
     * Verify if note was modified, and save it. Otherwise, do nothing.
     * @private
     */
    function _processNote(note) {
        if (ctrl.noteModified) {
            var isNewNote = ctrl.note.id ? false : true;
            if (isNewNote) {
                // add to check list
                checkListService.addTask(TASK_NAME_CREATE_NOTE, $translate.instant('notes.CHECKLIST_CREATE_NOTE'), ctrl.note);
            }
            else {
                // add to check list
                checkListService.addTask(TASK_NAME_UPDATE_NOTE, $translate.instant('notes.CHECKLIST_SAVE_NOTE'), ctrl.note);
            }

            return dataserviceNotes.saveNote(note);
        } else {
            return $q.resolve();
        }
    }

    // create new note instance for associated patient
    function _newInstanceNote() {
        if (ctrl.isShiftNote) {
            ctrl.note = dataserviceNotes.createShiftNote(ctrl.patientId, ctrl.visitNb);
        } else {
            ctrl.note = dataserviceNotes.createNote(ctrl.patientId, ctrl.visitNb);
        }
        ctrl.note.categoryId = ctrl.categoryId;
    }

    function _loadNote() {
        return dataserviceNotes.getNote(ctrl.noteId)
            .then(function (note) {
                ctrl.note = note;
            })
            .catch(function (exception) {
                if (exception.status === 404) {
                    ctrl.isEmpty = true;
                } else {
                    ctrl.isCrashed = true;
                    $translate('error.ERROR').then(function (translation) {
                        logger.error(translation, exception);
                    });
                }
            });
    }


    function _onCancelNoteSavingDialog() {
        checkListService.reset();
        _unlockNote();
        _onClose(false, false);
    }

    function _onClose(isSaved, isDeleted) {
        var onCloseFunction = ctrl.onClose();
        if (angular.isFunction(onCloseFunction)) {
            onCloseFunction(isSaved, isMode(MODE_NEW), isDeleted);
        }
    }

    function _assignNoteId(ctrl) {
        ctrl.noteId = ctrl.note.id;
        return $q.resolve();
    }

    /**
     * Create new note
     * @private
     */
    function _createNote() {
        /*
         -- mode "new" --
         1. process note: create note + get noteId
         2. Lock note (noteId)
         3. process pictures: [create new pictures + update existing pictures] + [re-ordering]
         */

        ctrl.noteSavingPipelineBlueprint = [
            { name: TASK_NAME_CREATE_NOTE, type: asyncPipelineBuilder.TYPE_TASK, fn: _processNote, params: [ctrl.note] },
            { name: "assignNoteId", type: asyncPipelineBuilder.TYPE_TASK, fn: _assignNoteId, params: [ctrl] },
            { name: "lockNote", type: asyncPipelineBuilder.TYPE_TASK, fn: _lockNote },
            { name: "processPictures", type: asyncPipelineBuilder.TYPE_IMPORT, fn: pictureService.processPictures, params: [ctrl.note] },
            { name: PIPELINE_NAME, type: asyncPipelineBuilder.TYPE_SEQUENCE, tasks: [TASK_NAME_CREATE_NOTE, "assignNoteId", "lockNote", "processPictures"] }
        ];

        ctrl.noteSavingPipelineFlow = asyncPipelineBuilder.processBlueprint(ctrl.noteSavingPipelineBlueprint);
        _onSaveNote();
    }

    /**
     * Update existing note
     * @private
     */
    function _updateNote() {
        /*
         -- mode "edit" --
         1. process note: update note
         2. process pictures: [create new pictures + update existing pictures] + [re-ordering]
         */

        ctrl.noteSavingPipelineBlueprint = [
            { name: TASK_NAME_UPDATE_NOTE, type: asyncPipelineBuilder.TYPE_TASK, fn: _processNote, params: [ctrl.note] },
            { name: "processPictures", type: asyncPipelineBuilder.TYPE_IMPORT, fn: pictureService.processPictures, params: [ctrl.note] },
            { name: PIPELINE_NAME, type: asyncPipelineBuilder.TYPE_GROUP, tasks: [TASK_NAME_UPDATE_NOTE, "processPictures"] }
        ];

        ctrl.noteSavingPipelineFlow = asyncPipelineBuilder.processBlueprint(ctrl.noteSavingPipelineBlueprint);
        _onSaveNote();
    }

    /**
     * Continue the process of saving a note, using the results of the previous note saving operation
     * @private
     */
    function _onContinueSaveNote() {
        // show "saving..."
        NoteSavingDialogService.showSaving();

        // Run pipeline again, skipping successful tasks (use results from previous note saving pipeline processing)
        ctrl.noteSavingPipelineFlow = asyncPipelineBuilder.processBlueprint(ctrl.noteSavingPipelineBlueprint, ctrl.noteSavingPipelineFlow);
        _onSaveNote();
    }

    /**
     * Perform steps to save a note that are common to creating a new note or updating an existing note.
     * @private
     */
    function _onSaveNote() {
        var pipeline = asyncPipelineBuilder.getPipeline(ctrl.noteSavingPipelineFlow, PIPELINE_NAME);
        pipeline.then(function (results) {

            asyncPipelineBuilder.setPipelineResults(ctrl.noteSavingPipelineFlow);

            var allTasksChecked = checkListService.allTasksCompleted();
            if (allTasksChecked) {
                logger.success($translate.instant('core.OPERATION_SUCCESSFUL'));

                checkListService.reset();
                _unlockNote();
                NoteSavingDialogService.closeDialog();
                _onClose(true, false);
            }
            else {
                // show checklist, try again...
                NoteSavingDialogService.setCheckList(checkListService.getCheckList());
                NoteSavingDialogService.showCheckList();
            }

        })
            .catch(function (exception) {
                logger.error($translate.instant('notes.ERROR_ON_ACTION', { noteId: ctrl.note.id, ACTION: 'SAVE' }));
                logger.sendReport(exception, exception.message);

                // show checklist, try again...
                NoteSavingDialogService.setCheckList(checkListService.getCheckList());
                NoteSavingDialogService.showCheckList();
            });
    }

}

export {
    Note,
    config
}
