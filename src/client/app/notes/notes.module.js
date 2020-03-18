import angular from 'angular';
import runRoute from './notes.route';
import { dataServiceNotes, run as runDataServiceNotes } from "./data/notes.dataservice";
import { dataServiceHistory, run as runDataServiceHistory } from './data/history.dataservice';
import { dataServiceNoteCategories, run as runDataServiceNoteCategories } from './data/notecategories.dataservice';
import { dataServicePictures, run as runDataServicePictures } from './data/pictures.dataservice';
import { dataServiceShiftNotes, run as runDataServiceShiftNotes } from './data/shiftNotes.dataservice';
import NoteController from "./note.controller";
import noteService from "./note.service";
import noteCategoryService from "./noteCategory.service";
import PictureService from "./picture.service";
import PictureStateHistoryService from "./pictureStateHistory.service";
import CheckListService from "./checklist/checklist.service";
import NoteCategoriesList from "./components/categories/noteCategoryList.component";
import NoteCategoryPageList from "./components/categories/noteCategoryList.component-page";
import NoteCategoriesListActions from "./components/categories/noteCategoryListActions.component";
import NoteCategoriesListCounter from "./components/categories/noteCategoryListCounter.component";
import NoteCategoriesListHead from "./components/categories/noteCategoryListHead.component";
import NoteCategoriesListSelection from "./components/categories/noteCategoryListSelection.component";
import NoteCategoriesListTabs from "./components/categories/noteCategoryListTabs.component";
import { Note, config as configNote } from './components/notes/note.component';
import NoteDetails from "./components/notes/noteDetails.component";
import NoteHeader from "./components/notes/noteHeader.component";
import NoteList from "./components/notes/noteList.component";
import NoteListItem from "./components/notes/noteListItem.component";
import NoteReadButton from "./components/notes/noteReadButton.component";
import NoteReadCounter from "./components/notes/noteReadCounter.component";
import NoteReadFilter from "./components/notes/noteReadFilter.component";
import NoteReadStatus from "./components/notes/noteReadStatus.component";
import NotesAndPicturesSummary from "./components/notes/notesAndPicturesSummary.component";
import NoteSavingDialogService from "./components/notes/noteSavingDialog.service";
import NoteSavingItem from "./components/notes/noteSavingItem.component";
import RestoreNote from "./components/notes/restoreNote.component";
import PatientNavigationButtonNotes from "./components/fecPatientNavigationButtonNotes.component";
import NavButtonNotes from "./components/navButtonNotes.component";
import NoteCategoryList from "./components/noteCategoryList.component";
import HistoryController from "./history/history.controller";
import NoteHistoryHeader from "./history/components/noteHistoryHeader.component";
import NoteHistoryItem from "./history/components/noteHistoryItem.component";
import NoteHistoryItemBody from "./history/components/noteHistoryItemBody.component";
import PictureHistoryItem from "./history/components/pictureHistoryItem.component";
import PictureHistoryItemBody from "./history/components/pictureHistoryItemBody.component";
import NoteCategoriesController from "./noteCategories/noteCategories.controller";
import NoteCategoryController from "./noteCategories/noteCategory.controller";
import ImageOnLoad from "./pictureDetails/imageOnLoad.directive";
import NotePictureDetailsService from "./pictureDetails/notePictureDetailsDialog.service";
import NotePictureFullScreenService from "./pictureFullScreen/notePictureFullScreenDialog.service";
import RestoreNotesController from "./restoreNotes/restoreNotes.controller";
import ShiftNotesController from "./shiftNotes/shiftNotes.controller";
import NoteImage from "./components/pictures/noteImage.component";
import NoteImageThumbnail from "./components/pictures/noteImageThumbnail.component";
import NotePictureDetails from "./components/pictures/notePictureDetails.component";
import NotePictureList from "./components/pictures/notePictureList.component";
import NotePictureListView from "./components/pictures/notePictureListView.component";
import NotePictureThumbnail from "./components/pictures/notePictureThumbnail.component";
import PictureGallery from "./components/pictures/pictureGallery.component";
import PictureRestoreDialogService from "./components/pictures/pictureRestoreDialog.service";

angular
    .module('app.notes', [
        'ngWig',
        //'mdPickers',

        // Required for routing
        'app.patient'
    ])
    .config(configNote)
    .run(runRoute)
    .run(runDataServiceNotes)
    .run(runDataServiceHistory)
    .run(runDataServiceNoteCategories)
    .run(runDataServicePictures)
    .run(runDataServiceShiftNotes)
    .factory('dataservice.notes', dataServiceNotes)
    .factory('dataservice.history', dataServiceHistory)
    .factory('dataservice.notecategories', dataServiceNoteCategories)
    .factory('dataservice.pictures', dataServicePictures)
    .factory('dataservice.shiftNotes', dataServiceShiftNotes)
    .controller('NoteController', NoteController)
    .factory('noteService', noteService)
    .factory('noteCategoryService', noteCategoryService)
    .factory('PictureService', PictureService)
    .factory('PictureStateHistoryService', PictureStateHistoryService)
    .factory('CheckListService', CheckListService)
    .component('fecNoteCategoriesList', NoteCategoriesList)
    .component('fecNoteCategoryPageList', NoteCategoryPageList)
    .component('fecNoteCategoriesListActions', NoteCategoriesListActions)
    .component('fecNoteCategoriesListCounter', NoteCategoriesListCounter)
    .component('fecNoteCategoriesListHead', NoteCategoriesListHead)
    .component('fecNoteCategoriesListSelection', NoteCategoriesListSelection)
    .component('fecNoteCategoriesListTabs', NoteCategoriesListTabs)
    .component('fecNote', Note)
    .component('fecNoteDetails', NoteDetails)
    .component('fecNoteHeader', NoteHeader)
    .component('fecNoteList', NoteList)
    .component('fecNoteListItem', NoteListItem)
    .component('fecNoteReadButton', NoteReadButton)
    .component('fecNoteReadCounter', NoteReadCounter)
    .component('fecNoteReadFilter', NoteReadFilter)
    .component('fecNoteReadStatus', NoteReadStatus)
    .component('fecNotesAndPicturesSummary', NotesAndPicturesSummary)
    .factory('NoteSavingDialogService', NoteSavingDialogService)
    .component('fecNoteSavingItem', NoteSavingItem)
    .component('fecRestoreNote', RestoreNote)
    .component('fecNoteImage', NoteImage)
    .component('fecNoteImageThumbnail', NoteImageThumbnail)
    .component('fecNotePictureDetails', NotePictureDetails)
    .component('fecNotePictureList', NotePictureList)
    .component('fecNotePictureListView', NotePictureListView)
    .component('fecNotePictureThumbnail', NotePictureThumbnail)
    .component('fecPictureGallery', PictureGallery)
    .factory('PictureRestoreDialogService', PictureRestoreDialogService)
    .component('fecPatientNavigationButtonNotes', PatientNavigationButtonNotes)
    .component('fecNavButtonNotes', NavButtonNotes)
    .component('fecNoteCategoryList', NoteCategoryList)
    .controller('HistoryController', HistoryController)
    .component('fecNoteHistoryHeader', NoteHistoryHeader)
    .component('fecNoteHistoryItem', NoteHistoryItem)
    .component('fecNoteHistoryItemBody', NoteHistoryItemBody)
    .component('fecPictureHistoryItem', PictureHistoryItem)
    .component('fecPictureHistoryItemBody', PictureHistoryItemBody)
    .controller('NoteCategoriesController', NoteCategoriesController)
    .controller('NoteCategoryController', NoteCategoryController)
    .directive('fecImageOnLoad', ImageOnLoad)
    .factory('notePictureDetails', NotePictureDetailsService)
    .factory('notePictureFullScreen', NotePictureFullScreenService)
    .controller('RestoreNotesController', RestoreNotesController)
    .controller('ShiftNotesController', ShiftNotesController)




