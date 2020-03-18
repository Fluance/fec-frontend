// import angular from 'angular';
import _ from 'lodash';
import template from './whiteboardSurgeryEditCommentDialog.tmpl.html';

/* @ngInject */
whiteboardSurgeryEditCommentDialogService.$inject = ['$mdDialog'];

function whiteboardSurgeryEditCommentDialogService($mdDialog) {

    var service = {
        editItem: editItem,
    };

    return service;

    function editItem(appointment, textareaWidth) {
        // var parentEl = angular.element(document.body);

        return $mdDialog.show({
            templateUrl: template,
            controller: ['$mdDialog', 'whiteboardSurgeryService', DialogController],
            controllerAs: '$ctrl',
            locals: {
                appointment: angular.copy(appointment),
                textareaWidth: textareaWidth
            },
            bindToController: true,
            clickOutsideToClose: true,
            escapeToClose: true
        }).then(function (appointment) {
            return {
                editedItem: appointment
            }
        }).catch(function () {
            return false;
        });

        function DialogController($mdDialog, whiteboardSurgeryService) {
            var ctrl = this;

            ctrl.closeDialog = closeDialog;
            ctrl.save = save;

            ctrl.$onInit = onInit;

            function onInit() {
                _loadAppointmentComment();
            }

            function _loadAppointmentComment() {
                whiteboardSurgeryService.getOperationNote(ctrl.appointment.appoint_id).then((data) => {
                    ctrl.operationNoteId = data.id;
                    ctrl.operationNote = data.note;
                    _lockItem();
                });
            }

            function _lockItem() {
                whiteboardSurgeryService.lockOperationNoteItem(ctrl.appointment.appoint_id).then((data) => {
                    ctrl.operationNoteLocked = false;
                }).catch((data) => {
                    ctrl.operationNoteLocked = true;
                });
            }

            function _unlockItem() {
                whiteboardSurgeryService.unlockOperationNoteItem(ctrl.appointment.appoint_id);
            }

            function save() {
                whiteboardSurgeryService.setOperationNote(ctrl.appointment.appoint_id, ctrl.operationNote).then((data) => {
                    closeDialog(data);
                }).catch(console.error);
            }

            function closeDialog(returnValue) {
                _unlockItem();
                $mdDialog.hide(returnValue);
            }
        }
    }
}

export default whiteboardSurgeryEditCommentDialogService;
