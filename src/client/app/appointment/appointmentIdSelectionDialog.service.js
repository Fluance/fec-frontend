import template from './appointmentIdSelectionDialog.tmpl.html';

/* @ngInject */
appointmentIdSelectionDialogService.$inject = [
    '$mdDialog',
    '$q',
    'dataservice.appointments',
    'fecNavigationContextService'
];

function appointmentIdSelectionDialogService(
    $mdDialog,
    $q,
    dataserviceAppointments,
    fecNavigationContextService
) {
    var DEFAULT_FROM_DATE = '1970-01-01';

    var service = {
        select: select
    };

    return service;

    // --------------------------------------------- Service methods

    function select() {
        return fecNavigationContextService.getContextItem('patientId')
        .then(function (patientId) {
            return dataserviceAppointments.getAppointmentListForPatient({
                pid: patientId,
                from: DEFAULT_FROM_DATE
            });
        })
        .then(function (appointments) {
            var parentEl = angular.element(document.body);
            var selectedAppointmentId;

            // only 1 appointment, automatically select it
            if(!_.isEmpty(appointments) && appointments.length === 1) {
                selectedAppointmentId = appointments[0].appointmentId;
                return selectedAppointmentId;
            }
            else {
                return $mdDialog.show({
                    parent: parentEl,
                    templateUrl: template,
                    controller: ['$mdDialog', DialogController],
                    controllerAs: '$ctrl',
                    clickOutsideToClose: true,
                    escapeToClose: true
                }).then(function () {
                    return selectedAppointmentId;
                }).catch(function (error) {
                    if (error) {
                        console.error(error);
                    }
                    return null;
                })
            }

            // ------------------------------------------ Dialog controller

            function DialogController($mdDialog) {
                var ctrl = this;
                var selected;

                ctrl.appointments = appointments;

                ctrl.closeDialog = closeDialog;
                ctrl.isSelected = isSelected;
                ctrl.selectElement = selectElement;

                function isSelected (appointmentId) {
                    return selected === appointmentId;
                }

                function selectElement (element) {
                    selectedAppointmentId = element;
                    $mdDialog.hide();
                }

                function closeDialog () {
                    $mdDialog.hide();
                }
            }
        });
    }
}

export default appointmentIdSelectionDialogService;
