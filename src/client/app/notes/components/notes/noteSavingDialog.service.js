import angular from 'angular';
import template from './noteSavingDialog.html';

NoteSavingDialogService.$inject = ['$mdDialog', 'CheckListService'];
function NoteSavingDialogService($mdDialog, CheckListService) {
    var service;

    service = {};
    service.model = {};
    service.model.showCheckList = false;
    service.model.isSaving = false;

    service.api = {
        setCheckList: setCheckList,
        openDialog: openDialog,
        closeDialog: closeDialog,
        showSaving: showSaving,
        showCheckList: showCheckList
    };

    return service.api;

    // ----------------------------------- Interface methods

    function openDialog(onSave, onCancel) {
        service.onSave = onSave;
        service.onCancel = onCancel;
        service.model.isSaving = true;
        service.model.showCheckList = false;
        service.model.cheklist = CheckListService.getCheckList();

        $mdDialog.show({
            controller: [noteSavingDialogController],
            controllerAs: 'vm',
            templateUrl: template,
            locals: {
                model: service.model
            },
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

    function tryAgain() {
        // call save
        service.onSave();
    }

    function setCheckList(checklist) {
        service.model.checklist = checklist;
    }

    function showSaving() {
        _setIsSaving(true);
        _setShowCheckList(false);
    }

    function showCheckList() {
        _setIsSaving(false);
        _setShowCheckList(true);
    }

    // ----------------------------------- Helper methods

    function _setShowCheckList(showCheckList) {
        service.model.showCheckList = showCheckList;
    }

    function _setIsSaving(isSaving) {
        service.model.isSaving = isSaving;

        if(!isSaving) {
            // get checklist data from service
            service.model.checklist = CheckListService.getCheckList();
        }
    }

    // ------------------------------------------------------ Dialog controller

    function noteSavingDialogController() {
        var vm = this;

        vm.tryAgain = tryAgain;
        vm.close = closeDialog;
    }
}

export default NoteSavingDialogService;
