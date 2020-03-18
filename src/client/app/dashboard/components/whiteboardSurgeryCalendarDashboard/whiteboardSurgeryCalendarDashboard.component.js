import template from './whiteboardSurgeryCalendarDashboard.component.html';

const WhiteboardSurgeryCalendarDashboard = {
    controller: controller,
    templateUrl: template
};

controller.$inject = [
    '$compile',
    '$rootScope',
    '$scope',
    '$state',
    'config',
    'dataservice.appointments',
    'sessionService',
    'smDatePickerLocalizationService'
];

function controller($compile, $rootScope, $scope, $state, config, dataServiceAppointments, sessionService, smDatePickerLocalizationService) {
    var ctrl = this;

    ctrl.DEFAULT_CODE_OCCUPATION_OPERATOR = 'Op';

    ctrl.locations = undefined;

    ctrl.goToPatient = goToPatient;
    ctrl.openWhiteboardSurgery = openWhiteboardSurgery;
    ctrl.openWhiteboardSurgeryAppointment = openWhiteboardSurgeryAppointment;
    ctrl.nextDay = nextDay;
    ctrl.previousDay = previousDay;

    ctrl.$onInit = onInit;
    ctrl.$onDestroy = onDestroy;

    // ------------------------------------------------------------------------- Event handling

    /**
     * Initialize the component
     */
    function onInit() {
        ctrl.unsuscribeCompanyChange = $rootScope.$on(sessionService.EVENT_SELECTED_COMPANY_CHANGED, _onCompanyChanged);
        ctrl.unsuscribeTranslateChange = $rootScope.$on('translationChanged', _onTranslationChanged);

        smDatePickerLocalizationService.setTranslation();

        ctrl.selectedDateForDatePicker = moment();
        $scope.$watch("$ctrl.selectedDateForDatePicker", function (newValue, oldValue) {
            if (newValue !== oldValue) {
                _loadAppointments();
            }
        });

        _loadAppointments();
    }

    function onDestroy() {
        if(ctrl.unsuscribeCompanyChange) {
            ctrl.unsuscribeCompanyChange();
        }
        if(ctrl.unsuscribeTranslateChange) {
            ctrl.unsuscribeTranslateChange();
        }
    }

    function _onCompanyChanged() {
        if (!_.isUndefined(config.whiteboardSurgery.operationRooms[sessionService.user.companyId])) {
            ctrl.selectedLocation = undefined;
            _loadAppointments();
        }
    }

    function _onTranslationChanged() {
        _refreshDatePicker();
        _onCompanyChanged();
    }

    function _refreshDatePicker() {
        smDatePickerLocalizationService.setTranslation();
    }

    // ------------------------------------------------------------------------- Interface methods

    /**
     * Go to the patient context according to the patient ID
     * @param {*} patientId
     */
    function goToPatient(patientId) {
        $state.go('patient', { pid: patientId });
    }

    /**
     * Open the whiteboard surgery view
     */
    function openWhiteboardSurgery() {
        $state.go('whiteboardSurgery', { date: ctrl.selectedDateForDatePicker });
    }

    /**
     * Open the whiteboard surgery appointment detail view
     */
    function openWhiteboardSurgeryAppointment(appointment) {
        const roomName = appointment.firstlocation;
        const appointmentId = appointment.appoint_id;

        $state.go('whiteboardSurgeryAppointmentDetail', { appointmentId: appointmentId, roomName: roomName, date: moment(ctrl.selectedDateForDatePicker).format('YYYY-MM-DD') });
    }

    /**
     * Add one day to the selected date
     */
    function nextDay() {
        ctrl.selectedDateForDatePicker = moment(ctrl.selectedDateForDatePicker).add(1, 'days');
        _loadAppointments();
    }

    /**
     * Subtract one day to the selected date
     */
    function previousDay() {
        ctrl.selectedDateForDatePicker = moment(ctrl.selectedDateForDatePicker).subtract(1, 'days');
        _loadAppointments();
    }

    // -----------------------------------------------------------------------------------------------------------

    /**
     * Load all appointments
     */
    function _loadAppointments() {
        ctrl.isLoading = true;

        // Prepare the locations
        ctrl.locations = {};
        _.each(config.whiteboardSurgery.operationRooms[sessionService.user.companyId], room => {
            ctrl.locations[room] = {};
        });

        var appointmentParams = {
            companyId: sessionService.user.companyId,
            limit: 1000,
            offset: 0,
            type: 'operation',
            fromDate: moment(ctrl.selectedDateForDatePicker).format('YYYY-MM-DD'),
            toDate: moment(ctrl.selectedDateForDatePicker).format('YYYY-MM-DD'),
            locationNames: config.whiteboardSurgery.operationRooms[sessionService.user.companyId]
        };

        dataServiceAppointments.getAppointmentsByRoom(appointmentParams).then((locations) => {
            _.each(locations, (value, key) => {
                ctrl.locations[key] = value;
            });
            if (_.isUndefined(ctrl.selectedLocation)) {
                ctrl.selectedLocation = _.keys(ctrl.locations)[0];
            }
            ctrl.isLoading = false;
        });
    }

}

export default WhiteboardSurgeryCalendarDashboard;
