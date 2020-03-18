import template from './fecOperationNoteBox.component.html';

const fecOperationNoteBox = {
    bindings: {
        title: '@',
        appointmentId: '<'
    },
    controller: controller,
    templateUrl: template
};


controller.$inject = ['whiteboardSurgeryService'];
function controller(whiteboardSurgeryService) {
    var ctrl = this;
    ctrl.isEditModeActive = false;

    ctrl.activateEditMode = activateEditMode;
    ctrl.deactivateEditMode = deactivateEditMode;
    ctrl.saveOperationNote = saveOperationNote;

    ctrl.$onInit = onInit;

    function onInit() {
        _loadAppointmentOperationNote();
    }

    function _loadAppointmentOperationNote() {
        ctrl.operationNoteIsLoading = true;
        return whiteboardSurgeryService.getOperationNote(ctrl.appointmentId).then((data) => {
            ctrl.operationNote = data.note;
            ctrl.operationNoteBeforeSave = data.note;
            ctrl.operationNoteIsLoading = false;
        }).catch(error => {
            ctrl.operationNoteIsLoading = false;
        });
    }

    function _lockItem() {
        whiteboardSurgeryService.lockOperationNoteItem(ctrl.appointmentId).then((data) => {
            ctrl.operationNoteLocked = false;
        })
        .then(_loadAppointmentOperationNote())
        .then(() => {
            ctrl.isEditModeActive = true;
        })
        .catch((data) => {
            ctrl.operationNoteLocked = true;
            ctrl.isEditModeActive = false;
        });
    }

    function _unlockItem() {
        if (!ctrl.operationNoteLocked) {
            whiteboardSurgeryService.unlockOperationNoteItem(ctrl.appointmentId).then(data => {
                ctrl.isEditModeActive = false;
            });
        }
    }

    function activateEditMode() {
        _lockItem();
    }

    function deactivateEditMode() {
        _unlockItem();
    }

    function saveOperationNote() {
        if (!ctrl.operationNoteLocked) {
            whiteboardSurgeryService.setOperationNote(ctrl.appointmentId, ctrl.operationNote).then((data) => {
                deactivateEditMode();
            }).catch((errorMessage) => {
                ctrl.operationNote = ctrl.operationNoteBeforeSave;
                console.error(errorMessage);
            });
        }
    }
}

export default fecOperationNoteBox;
