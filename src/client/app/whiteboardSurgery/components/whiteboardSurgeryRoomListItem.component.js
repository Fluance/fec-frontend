import template from './whiteboardSurgeryRoomListItem.component.html';
import moment from 'moment';

const WhiteboardSurgeryRoomListItem = {
    bindings: {
        roomTitle: '<?',
        runningAppointment: '<?',
        nextAppointment: '<?',
        detail: '<?',
        selectedDate: '<?'
    },
    controller: controller,
    templateUrl: template
};

controller.$inject = [
    '$interval',
    '$rootScope',
    '$state',
    '$stateParams',
    '$timeout',
    'dataservice.appointments',
    'config',
    'fecNavigationContextService',
    'whiteboardSurgeryService',
    'whiteboardSurgeryEditCommentDialogService'
];

function controller(
    $interval,
    $rootScope,
    $state,
    $stateParams,
    $timeout,
    dataServiceAppointments,
    config,
    fecNavigationContextService,
    whiteboardSurgeryService,
    whiteboardSurgeryEditCommentDialogService
) {
    var ctrl = this;
    var secondsUntilAutoScrollCheck = !_.isUndefined(config.whiteboardSurgery) && !_.isUndefined(config.whiteboardSurgery.autoScrollResetTimeAfterSaveComment) ? config.whiteboardSurgery.autoScrollResetTimeAfterSaveComment : 180;
    var autoScrollTimerPromise = undefined;
    var operationCommentsRefreshHandler;
    var operationTimesRefreshHandler;

    //static values
    ctrl.DEFAULT_CODE_OCCUPATION_OPERATOR = 'Op';
    ctrl.DEFAULT_CODE_OCCUPATION_STAFF = 'OpAss';

    // Public methods
    ctrl.editComments = editComments;
    ctrl.goToAppointment = goToAppointment;
    ctrl.goToRoomView = goToRoomView;
    ctrl.goToPatient = goToPatient;

    ctrl.selectedDateIsToday;

    ctrl.$onInit = onInit;
    ctrl.$onDestroy = onDestroy;

    // Events
    ctrl.$onChanges = onChanges;

    /**
     * Style the appointments as soon as they change
     * @param {*} changes
     */
    function onChanges(changes) {
        if (changes && changes.runningAppointment) {
            if (!_.isNil(changes.runningAppointment.currentValue) && !_.isUndefined(changes.runningAppointment.currentValue.appoint_id)) {
                onInit();

            } else if (!_.isUndefined(changes.runningAppointment.previousValue) && (_.isUndefined(changes.runningAppointment.currentValue) || changes.runningAppointment.currentValue == null)) {
                _destroyInterval();
            }
        }
    }

    function onInit() {
        _setSelectedDateIsToday();
        if (ctrl.detail && !_.isUndefined(ctrl.runningAppointment)) {
            $rootScope.$on(whiteboardSurgeryService.SURGERYBOARD_REFRESH_EVENT, function (event, data) {
                if (data && data.refreshEnabled) {
                    _initializeOperationTimesInterval();
                    _initializeCommentsInterval();
                } else {
                    _destroyInterval();
                }
            });
            _initializeOperationTimesInterval();
            _initializeCommentsInterval();
            _loadAppointmentComment();
        } else if (!_.isUndefined(ctrl.runningAppointment)) {
            _initializeOperationTimesInterval();
        }
    }

    /**
     * Destroy interval before leaving the component
     */
    function onDestroy() {
        _destroyInterval();
    }

    /**
     * Destroy the refresh interval
     */
    function _destroyInterval() {
        if (!_.isUndefined(operationTimesRefreshHandler)) {
            $interval.cancel(operationTimesRefreshHandler);
            operationTimesRefreshHandler = undefined;
        }
        if (!_.isUndefined(operationCommentsRefreshHandler)) {
            $interval.cancel(operationCommentsRefreshHandler);
            operationCommentsRefreshHandler = undefined;
        }
    }

    /**
     * Initialize the refresh interval
     */
    function _initializeOperationTimesInterval() {
        if (ctrl.runningAppointment) {
            if (ctrl.runningAppointment.appointmentsInProgress && _.isUndefined(operationTimesRefreshHandler)) {
                _setOperationStatusRefreshInterval();
            } else if (!ctrl.runningAppointment.appointmentsInProgress) {
                _loadAppointmentOperationStatus();
            }
        }
    }

    /**
     * Set the comment refresh interval
     */
    function _initializeCommentsInterval() {
        if (_.isUndefined(operationCommentsRefreshHandler)) {
            _setCommentsRefreshInterval();
        }
    }

    /**
     * Set the refresh interval
     */
    function _setOperationStatusRefreshInterval() {
        _loadAppointmentOperationStatus();
        operationTimesRefreshHandler = $interval(_loadAppointmentOperationStatus, (config.whiteboardSurgery.operatingTimesRefreshInterval * 1000));
    }

    function editComments() {

        if (autoScrollTimerPromise) {
            $timeout.cancel(autoScrollTimerPromise);
        }

        $rootScope.$emit(whiteboardSurgeryService.SURGERYBOARD_REFRESH_EVENT, { refreshEnabled: false });

        const textareaWidth = document.getElementById('whiteboard-surgery-comments-container').offsetWidth + 'px';
        whiteboardSurgeryEditCommentDialogService.editItem(ctrl.runningAppointment, textareaWidth).then((data) => {
            if (ctrl.detail && !_.isUndefined(ctrl.runningAppointment)) {
                _loadAppointmentComment();
            }

            autoScrollTimerPromise = $timeout(_refreshSurgeryboardScroll, secondsUntilAutoScrollCheck * 1000);
        });
    }

    function _refreshSurgeryboardScroll() {
        $rootScope.$emit(whiteboardSurgeryService.SURGERYBOARD_REFRESH_EVENT, { refreshEnabled: true });
    }

    /**
     * Navigate to the appointment by the given appointment ID
     * @param {*} appointmentId
     */
    function goToAppointment(appointmentId) {
        fecNavigationContextService.setContextItem('roomName', $stateParams.roomName);
        $state.go('appointment', { aid: appointmentId, originParams: { roomName: $stateParams.roomName, appointmentId: $stateParams.appointmentId, date: $stateParams.date }, originState: 'whiteboardSurgeryRoom' });
    }

    /**
     * Navigate to a specific whitebord surgery room
     */
    function goToRoomView() {
        $state.go('whiteboardSurgeryRoom', { 'roomName': ctrl.roomTitle });
    }

    /**
     * Navigate to the patient page
     */
    function goToPatient(patientId) {
        $state.go('patient', { pid: patientId, originParams: { roomName: $stateParams.roomName, appointmentId: $stateParams.appointmentId, date: $stateParams.date }, originState: 'whiteboardSurgeryRoom' });
    }

    /**
     * Set the refresh interval
     */
    function _setCommentsRefreshInterval() {
        _loadAppointmentComment();
        operationCommentsRefreshHandler = $interval(_loadAppointmentComment, (config.whiteboardSurgery.autoRefreshIntervalComment * 1000));
    }

    function _loadAppointmentComment() {
        ctrl.isLoadingComment = true;
        whiteboardSurgeryService.getOperationNote(ctrl.runningAppointment.appoint_id).then((data) => {
            ctrl.operationNote = data.note;
            ctrl.isLoadingComment = false;
        }).catch(error => {
            ctrl.isLoadingComment = false;
        });
    }

    /**
     * Set if the selected date is today, but only if it's not already set.
     */
    function _setSelectedDateIsToday() {
        if (_.isUndefined(ctrl.selectedDateIsToday)) {
            ctrl.selectedDateIsToday = ctrl.selectedDate && (moment().startOf('day').diff(moment(ctrl.selectedDate).startOf('day'), 'days') === 0) ? true : false;
        }
    }

    /**
     * Load the appointment operation status list
     */
    function _loadAppointmentOperationStatus() {
        if (ctrl.runningAppointment) {
            const appointmentId = ctrl.runningAppointment.appoint_id;
            dataServiceAppointments.getAppointmentOperationStatus(appointmentId).then(data => {
                ctrl.operationStatusList = data;
                ctrl.liveOperationStatus = _.find(data, function (operationStatus) { return operationStatus.live; });
            });
        }
    }
}

export default WhiteboardSurgeryRoomListItem;
