import template from './appointment-details.component.html';

const Appointment = {
    templateUrl: template,
    bindings: {
        aid: '<'
    },
    controller: controller
};

controller.$inject = [
    '$rootScope',
    '$stateParams',
    '$translate',
    'dataservice.appointments',
    'logger'
];

/* @ngInject */
function controller(
    $rootScope,
    $stateParams,
    $translate,
    dataserviceAppointments,
    logger
) {
    var ctrl = this;

    ctrl.$onInit = onInit;
    ctrl.$onDestroy = onDestroy;
    // --------------------------------------------------------------

    function onInit() {
        var ctrl = this;

        ctrl.aid = $stateParams.aid;

        //Check if user has access to physician list
        //ctrl.hasAccess = true;

        // Populate our scope (as vm)
        $.extend(ctrl, {
            isComplete: false,
            isEmpty: false,
            isException: false,
            isLoadingDetails: false
        });

        _getAppointmentDetails(ctrl.aid);

        ctrl.unsuscribeTranslateChange = $rootScope.$on('$translateChangeSuccess', function (event, current, previous) {
            _getAppointmentDetails(ctrl.aid);
        });

    }

    function onDestroy() {
        if (ctrl.unsuscribeTranslateChange) { ctrl.unsuscribeTranslateChange(); }
    }

    function _getAppointmentDetails(aid) {
        ctrl.isLoadingDetails = true;
        return dataserviceAppointments.getAppointmentDetails(aid)
            .then(function (appointment) {
                appointment.isExpanded = true;
                ctrl.appointment = appointment;
                ctrl.patientName = appointment.patient.lastName + " " + appointment.patient.firstName;
                ctrl.appointmentDeeplink = location.href;
                if (appointment && appointment.appointmentType === 'operation') {
                    _loadAppointmentOperationStatus(ctrl.aid)
                }
            })
            .catch(function (exception) {
                if (exception.status === 404) {
                    ctrl.isEmpty = true;
                } else {
                    ctrl.isException = true;
                    $translate('error.ERROR').then(function (translation) {
                        logger.error(translation, exception);
                    });
                }
            })
            .finally(function () {
                ctrl.isLoadingDetails = false;
            });
    }

    /**
     * Load the appointment operation status list
     */
    function _loadAppointmentOperationStatus(appointmentId) {
        if (ctrl.appointment.appointmentType === 'operation') {
            dataserviceAppointments.getAppointmentOperationStatus(appointmentId).then(data => {
                ctrl.operationStatusList = data;
            });
        }
    }
}

export default Appointment;

