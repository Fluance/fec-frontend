import templateNoteCategory from './noteCategories/noteCategory.html';
import templateNoteCategories from './noteCategories/noteCategories.html';
import templateShiftNotes from './shiftNotes/shiftNotes.html';
import templateNote from './note.html';
import templateRestoreNotes from './restoreNotes/restoreNotes.html';
import templateNoteHistory from './history/history.html';

run.$inject = ['routerService'];

/* @ngInject */
function run(routerService) {
    routerService.configureStates(getStates());
}

function getStates() {
    return [{
            state: 'patientNoteCategory',
            config: {
                parent: 'layoutPatient',
                url: '/patients/{pid}/notecategories/{categoryId}',
                templateUrl: templateNoteCategory,
                controller: 'NoteCategoryController',
                controllerAs: 'vm',
                titleI18n: 'notes.CATEGORY',
                navigationTitle: 'notes.NAVIGATION_TITLE',
                requiredTranslationParts: ['notes']
            }
        }, {
            state: 'visitNoteCategory',
            config: {
                parent: 'layoutPatient',
                url: '/visits/{vnb}/notecategories/{categoryId}',
                templateUrl: templateNoteCategory,
                controller: 'NoteCategoryController',
                controllerAs: 'vm',
                titleI18n: 'notes.CATEGORY',
                navigationTitle: 'notes.NAVIGATION_TITLE',
                requiredTranslationParts: ['notes']
            }
        }, {
            state: 'patientShiftNotes',
            config: {
                parent: 'layoutPatient',
                url: '/patients/{pid}/shiftNotes',
                templateUrl: templateShiftNotes,
                controller: 'ShiftNotesController',
                controllerAs: 'vm',
                titleI18n: 'notes.SHIFT_NOTES',
                navigationTitle: 'notes.NAVIGATION_TITLE',
                requiredTranslationParts: ['notes']
            }
        }, {
            state: 'visitShiftNotes',
            config: {
                parent: 'layoutPatient',
                url: '/visits/{vnb}/shiftNotes',
                templateUrl: templateShiftNotes,
                controller: 'ShiftNotesController',
                controllerAs: 'vm',
                titleI18n: 'notes.SHIFT_NOTES',
                navigationTitle: 'notes.NAVIGATION_TITLE',
                requiredTranslationParts: ['notes']
            }
        }, {
            state: 'noteCategories',
            config: {
                parent: 'layoutPatient',
                url: '/patients/{pid}/notecategories',
                templateUrl: templateNoteCategories,
                controller: 'NoteCategoriesController',
                controllerAs: 'vm',
                titleI18n: 'notes.NOTE_CATEGORIES',
                navigationTitle: 'notes.NAVIGATION_TITLE',
                requiredTranslationParts: ['notes']
            }
        }, {
            state: 'notesByNoteCategory',
            config: {
                parent: 'layoutPatient',
                url: '/notecategories/{categoryId}/notes',
                templateUrl: templateNoteCategory,
                controller: 'NoteCategoryController',
                controllerAs: 'vm',
                titleI18n: 'notes.NOTE_CATEGORY',
                navigationTitle: 'notes.NAVIGATION_TITLE',
                requiredTranslationParts: ['notes']
            }
        },
        {
            state: 'newNote',
            config: {
                parent: 'layoutPatient',
                url: '/notes/new?{pid}&{vnb}&{categoryId}&{shift}',
                templateUrl: templateNote,
                controller: 'NoteController',
                controllerAs: 'vm',
                titleI18n: 'notes.NEW_NOTE',
                navigationTitle: 'notes.NAVIGATION_TITLE',
                requiredTranslationParts: ['core', 'notes']
            }
        },
        {
            state: 'readNote',
            config: {
                parent: 'layoutPatient',
                url: '/notes/{noteId}?{pid}&{vnb}',
                templateUrl: templateNote,
                controller: 'NoteController',
                controllerAs: 'vm',
                titleI18n: 'notes.VIEW_NOTE',
                navigationTitle: 'notes.NAVIGATION_TITLE',
                requiredTranslationParts: ['core', 'notes']
            }
        },
        {
            state: 'editNote',
            config: {
                parent: 'layoutPatient',
                url: '/notes/{noteId}/edit?{pid}&{vnb}',
                templateUrl: templateNote,
                controller: 'NoteController',
                controllerAs: 'vm',
                titleI18n: 'notes.EDIT_NOTE',
                navigationTitle: 'notes.NAVIGATION_TITLE',
                requiredTranslationParts: ['core', 'notes']
            }
        },
        {
            state: 'restorePatientNote',
            config: {
                parent: 'layoutPatient',
                url: '/notes/patients/{pid}/restore',
                templateUrl: templateRestoreNotes,
                controller: 'RestoreNotesController',
                controllerAs: 'vm',
                titleI18n: 'notes.RESTORE_NOTES',
                navigationTitle: 'notes.NAVIGATION_TITLE',
                requiredTranslationParts: ['core', 'notes']
            }
        },
        {
            state: 'restoreVisitNote',
            config: {
                parent: 'layoutPatient',
                url: '/notes/visits/{vnb}/restore',
                templateUrl: templateRestoreNotes,
                controller: 'RestoreNotesController',
                controllerAs: 'vm',
                titleI18n: 'notes.RESTORE_NOTES',
                navigationTitle: 'notes.NAVIGATION_TITLE',
                requiredTranslationParts: ['core', 'notes']
            }
        },
        {
            state: 'noteHistoryList',
            config: {
                parent: 'layoutPatient',
                url: '/notes/{noteId}/history?{pid}&{vnb}',
                templateUrl: templateNoteHistory,
                controller: 'HistoryController',
                controllerAs: 'vm',
                titleI18n: 'notes.HISTORY_LIST',
                navigationTitle: 'notes.NAVIGATION_TITLE',
                requiredTranslationParts: ['notes']
            }
        }
        /*,
                    {
                        state: 'noteHistory',
                        config: {
                            parent: 'layoutPatient',
                            url: '/notes/{noteId}/history/{historyId}',
                            templateUrl: 'app/notes/note.html',
                            controller: 'NoteController',
                            controllerAs: 'vm',
                            titleI18n: 'notes.HISTORY_NOTE',
                            requiredTranslationParts: ['notes']
                        }
                    }*/
    ];
}

export default run;
