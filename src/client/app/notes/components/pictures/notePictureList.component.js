import _ from 'lodash';
import template from './notePictureList.component.html';

const NotePictureList = {
    bindings: {
        noteId: '<',
        displayMode: '@',
        pictureEdit: '@',
        pictureEditOnChange: '&',
        isDisabled: '<',
        showAnnotationIcon: '@'
    },
    controller: [
        '$scope',
        '$filter',
        'dataservice.notes',
        'dataservice.pictures',
        'PictureService',
        'PictureStateHistoryService',
        'logger',
        'notePictureDetails',
        //'LayoutPatientContextBox',
        //'tutorialService',
        'PictureRestoreDialogService',
        'fecImageEditorDialogService',
        controller
    ],
    templateUrl: template
};

function controller(
    $scope,
    $filter,
    dataserviceNotes,
    dataservicePictures,
    pictureService,
    pictureStateHistoryService,
    logger,
    notePictureDetails,
    //ContextBox,
    //tutorialService,
    PictureRestoreDialogService,
    fecImageEditorDialogService
) {
    var ctrl = this;
    var activeMode = 'edit';
    var selectedPictures = [];

    ctrl.title = 'Note Picture List';

    ctrl.note = {};
    ctrl.needsReordering = false;
    ctrl.hasRestorePictures = false;

    ctrl.$onInit = onInit;
    ctrl.isAlignHorizontal = isAlignHorizontal;
    ctrl.isAlignVertical = isAlignVertical;
    ctrl.isEditMode = isEditMode;
    ctrl.hasAnnotation = hasAnnotation;
    ctrl.hasMode = hasMode;
    ctrl.addPicture = addPicture;
    ctrl.deletePicture = deletePicture;
    ctrl.deleteAllPictures = deleteAllPictures;
    ctrl.openRestorePictures = openRestorePictures;
    ctrl.setMode = setMode;
    ctrl.pictureModified = pictureModified;
    ctrl.showPictureDetails = showPictureDetails;
    ctrl.onChange = onChange;

    // ------------------------------------------------------------------------- Event handling

    function onInit() {
        ctrl.isDisabled = _.isBoolean(ctrl.isDisabled) ? ctrl.isDisabled : false;

        ctrl.sortableOptions = {
            handle: '.list-item-reorder',
            disabled: ctrl.isDisabled,
            'ui-floating': true,
            items: '.sortable-item',
            stop: () => {
                pictureStateHistoryService.reorderPictures(_getPicturesOrder());
                ctrl.onChange();
            }
        };

        // existing note
        if (ctrl.noteId) {
            _loadNote(ctrl.noteId);

            // load note pictures
            _loadPictures(ctrl.noteId);
        }
        // don't load picture list if it's a new note
        else {
            ctrl.totalCount = 0;
            ctrl.pictureList = [];
        }

        // start with a clean state history
        pictureStateHistoryService.resetHistory();
    }

    // ------------------------------------------------------------------------- Component methods

    function isAlignHorizontal() {
        return ctrl.pictureAlign === 'horizontal';
    }

    function isAlignVertical() {
        return ctrl.pictureAlign === 'vertical';
    }

    function isEditMode() {
        return ctrl.pictureEdit && ctrl.pictureEdit === 'true';
    }

    function hasMode(mode) {
        return activeMode === mode;
    }

    function setMode(mode) {
        activeMode = mode;
    }

    function openRestorePictures() {
        PictureRestoreDialogService.openDialog(_restorePictures, function () {
        }, ctrl.pictureList);
    }

    function hasAnnotation(picture) {
        return picture.annotation;
    }

    function deleteAllPictures() {
        _.each(_.filter(ctrl.pictureList, function (o) {
            return !o.deleted;
        }), function (picture) {
            deletePicture(picture);
        });
    }

    function deletePicture(picture) {
        // move picture to list of deleted pictures
        _removePictureFromList(ctrl.pictureList, picture);

        // mark picture as deleted
        picture.deleted = true;
        picture.restored = false;

        // state history
        pictureStateHistoryService.deleted(picture);

        _addPictureToList(ctrl.pictureList, picture);

        // reorder pictures
        pictureStateHistoryService.reorderPictures(_getPicturesOrder());

        //The picture is on restore list, enable icon
        ctrl.hasRestorePictures = true;

        // user is interacting..
        ctrl.onChange();
    }

    /**
     * Add picture to list of pictures of selected note
     * @param file selected image (File: {name, lastModified, lastModifiedDate, size, type}).
     */
    function addPicture(file) {
        if (file !== null) {
            fecImageEditorDialogService.editImage(file, _addPictureCallback, 400);
        }
    }

    function _addPictureCallback(file) {
        var newPicture = dataservicePictures.createInstance(ctrl.note);
        newPicture.file = file;

        _addPictureToList(ctrl.pictureList, newPicture);

        // state history
        pictureStateHistoryService.created(newPicture);

        // reorder pictures
        pictureStateHistoryService.reorderPictures(_getPicturesOrder());

        // user is interacting..
        ctrl.onChange();
    }

    function pictureModified(picture) {
        // state history
        pictureStateHistoryService.modified(picture);

        // user is interacting..
        ctrl.onChange();
    }

    function showPictureDetails($event, pictureId) {
        dataservicePictures.getThumbnails(ctrl.noteId)
            .then(function(pictureList) {
                notePictureDetails.showPictureDetails($event, pictureId, pictureList);
            });
    }

    // --------------------------------------------------------------- Helper methods

    function _restorePictures(pictures) {
        _.each(pictures, function (picture) {
            _restorePicture(picture);
        });

        //if there aren't deleted pictures after restore disable icon
        var picturesDeleted = $filter('filter')(ctrl.pictureList, {deleted: 'true'});
        ctrl.hasRestorePictures = picturesDeleted.length !== 0;
    }

    function _restorePicture(picture) {
        // move picture to list of pictures
        _removePictureFromList(ctrl.pictureList, picture);

        // mark picture as restored
        picture.deleted = false;
        picture.restored = true;

        // state history
        pictureStateHistoryService.restored(picture);

        _addPictureToList(ctrl.pictureList, picture);

        // reorder pictures
        pictureStateHistoryService.reorderPictures(_getPicturesOrder());

        // user is interacting..
        ctrl.onChange();
    }

    function _loadNote(noteId) {
        // load note
        dataserviceNotes
            .getNote(noteId)
            .then(function(note) {
                ctrl.note = note;
            });
    }

    function _loadPictures(noteId) {
        // load pictures
        dataservicePictures
            .getThumbnails(noteId)
            .then(function(pictureList) {
                ctrl.pictureList = _.isArray(pictureList) ? pictureList : [];
                ctrl.totalCount = ctrl.pictureList.length;

                // add to list: pictures to restore
                _loadPicturesToRestore(noteId);
            });
    }

    function _loadPicturesToRestore(noteId) {
        // load deleted pictures
        dataservicePictures
            .getPicturesToRestore(noteId, true)
            .then(function(deletedPictureList) {
                //if there aren't deleted pictures disable icon
                ctrl.hasRestorePictures = deletedPictureList.length !== 0;
                ctrl.pictureList = _.union(ctrl.pictureList, deletedPictureList);
            });
    }

    function onChange() {
        if (_.isFunction(ctrl.pictureEditOnChange)) {
            ctrl.pictureEditOnChange();
        }
    }

    function _getPicturesOrder() {
        var picturesOrder = [];

        // adjust picture ordering
        _.each(ctrl.pictureList, function (picture) {
            // only set order value of pictures not marked to be deleted
            if (!picture.deleted) {
                picturesOrder.push(picture);
            }
        });

        return picturesOrder;
    }

    function _removePictureFromList(list, picture) {
        return _.remove(list, function (item) {
            return item === picture;
        });
    }

    function _addPictureToList(list, picture) {
        if (_.isArray(list)) {
            return list.unshift(picture);
        }
    }

    function _setNeedsPictureReordering() {
        ctrl.needsReordering = true;
    }

    // ------------------------------------------------------------------------------- Tutorial

}

export default NotePictureList;
