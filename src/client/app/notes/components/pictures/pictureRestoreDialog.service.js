import angular from 'angular';
import _ from 'lodash';
import template from './pictureRestoreDialog.html';

PictureRestoreDialogService.$inject = ['$mdDialog'];
function PictureRestoreDialogService($mdDialog) {
    var service;
    var selectedPictures = [];
    var pictureList = [];

    service = {};

    service.api = {
        openDialog: openDialog,
        closeDialog: closeDialog
    };

    return service.api;

    // ----------------------------------- Interface methods

    function openDialog(onSave, onCancel, pictures) {
        service.onSave = onSave;
        service.onCancel = onCancel;
        selectedPictures = [];
        pictureList = pictures;

        $mdDialog.show({
            controller: [pictureRestoreDialogController],
            controllerAs: 'vm',
            templateUrl: template,
            bindToController: true,
            parent: angular.element(document.body),
            autoWrap: true,
            clickOutsideToClose: false,
            escapeToClose: false,
            fullscreen: true // Only for -xs, -sm breakpoints.
        });
    }

    function closeDialog() {
        $mdDialog.hide();
        service.onCancel();
    }

    function saveDialog() {
        $mdDialog.hide();
        service.onSave(selectedPictures);
    }

    function pictureSelection(picture) {
        isPictureSelected(picture) ? _removePicture(picture) : selectedPictures.push(picture);
    }

    function isPictureSelected(picture) {
        return _getPictureIndex(picture) >= 0;
    }

    function _getPictureIndex(picture) {
        return _.findIndex(selectedPictures, function (selectedPicture) {
            return picture === selectedPicture;
        });
    }

    function _removePicture(picture) {
        selectedPictures = _.remove(selectedPictures, function (selectedPicture) {
            return picture != selectedPicture;
        });
    }

    function hasSelectedPictures() {
        return selectedPictures && selectedPictures.length > 0;
    }

    // ------------------------------------------------------ Dialog controller

    function pictureRestoreDialogController() {
        var vm = this;

        vm.save = saveDialog;
        vm.close = closeDialog;
        vm.pictureSelection = pictureSelection;
        vm.pictureList = pictureList;
        vm.hasSelectedPictures = hasSelectedPictures;
        vm.isPictureSelected = isPictureSelected;
    }
}


export default PictureRestoreDialogService;
