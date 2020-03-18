import _ from 'lodash';
import template from './notePictureListView.component.html';

const NotePictureListView = {
    bindings: {
        displayMode: '@',
        limit: '<',
        noteId: '<',
        showSymbols: '@'
    },
    controller: ['dataservice.notes', 'dataservice.pictures', 'notePictureDetails', 'notePictureFullScreen', '$filter', controller],
    controllerAs: 'vm',
    class: 'note-picture-list',
    templateUrl: template
};

function controller(dataserviceNotes, dataservicePictures, notePictureDetails, notePictureFullScreen, $filter) {
    var DEFAULT_PREVIEW_COUNT = 5,
        DEFAULT_MAX_LIMIT = 100;

    var vm = this;
    vm.hasRemainCount = false;
    vm.note = {};
    vm.remainCount = 0;

    vm.$onInit = onInit;
    vm.hasAnnotation = hasAnnotation;
    vm.showPictureDetails = showPictureDetails;

    vm.showDialogFullScreen = showDialogFullScreen;

    // ------------------------------------------------------------------------- Event handling

    function onInit() {
        vm.displayMode = _.isString(vm.displayMode) ? vm.displayMode : 'gallery';
        vm.limit = _.isBoolean(vm.limit) ? vm.limit : false;
        vm.maxCount = _.isBoolean(vm.limit) ? (vm.limit ? DEFAULT_PREVIEW_COUNT : DEFAULT_MAX_LIMIT) : DEFAULT_MAX_LIMIT;
        vm.showSymbols = _.isBoolean(vm.showSymbols) ? vm.showSymbols : false;

        // existing note
        if (vm.noteId) {
            _loadNote(vm.noteId);

            // load note pictures
            _loadPictures(vm.noteId);

            vm.listModeFullScreen = false;
        }
    }

    // ------------------------------------------------------------------------- Component methods

    function hasAnnotation(picture) {
        return !_.isEmpty(picture.annotation);
    }

    function showPictureDetails($event, pictureId) {
        dataservicePictures.getThumbnails(vm.noteId)
            .then(function(pictureList) {
                notePictureDetails.showPictureDetails($event, pictureId, pictureList);
            });
    }

    function showDialogFullScreen($event, pictureId) {
        var url = dataservicePictures.getPictureUrl(pictureId);

        notePictureFullScreen.showPictureFullScreen($event, url);
    }

    // --------------------------------------------------------------- Helper methods

    function _loadNote(noteId) {
        // load note
        dataserviceNotes
            .getNote(noteId)
            .then(function (note) {
                vm.note = note;
            });
    }

    function _loadPictures(noteId) {
        // get picture count
        dataservicePictures.getPicturesCount(noteId)
            .then(function (count) {
                vm.totalCount = count;

                if (count > 0) {
                    // load pictures for preview
                    dataservicePictures
                        .getThumbnails(noteId, 0, vm.maxCount)
                        .then(function (pictureList) {
                            // calculate remain pictures count and slice array with only partial list of pictures
                            _setPictureListPreview(pictureList, count);
                        });
                }
            });
    }


    function _setPictureListPreview(pictureList, totalCount) {
        if (totalCount === 0) {
            vm.pictureListPreview = [];
            return;
        }

        // slice picture list if there is a max count
        if (vm.limit && totalCount > DEFAULT_PREVIEW_COUNT) {
            vm.remainCount = totalCount - pictureList.length;
            vm.hasRemainCount = true;
            vm.pictureListPreview = pictureList.slice(0, vm.maxCount);
        }
        // show all pictures
        else {
            vm.hasRemainCount = false;
            vm.pictureListPreview = pictureList;
        }
    }

}

export default NotePictureListView;

