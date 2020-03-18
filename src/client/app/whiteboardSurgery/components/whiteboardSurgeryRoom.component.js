import _ from 'lodash';
import moment from 'moment';
import template from './whiteboardSurgeryRoom.component.html';

const WhiteboardSurgeryRoom = {
    controller: controller,
    templateUrl: template
};

controller.$inject = [
    '$interval',
    '$rootScope',
    '$scope',
    '$state',
    '$stateParams',
    '$timeout',
    '$translate',
    'dataservice.appointments',
    'config',
    'logger',
    'sessionService',
    'smDatePickerLocalizationService',
    'whiteboardSurgeryService',
    'whiteboardSurgeryRoomReservationDialogService'
];

function controller(
    $interval,
    $rootScope,
    $scope,
    $state,
    $stateParams,
    $timeout,
    $translate,
    appointmentService,
    config,
    logger,
    sessionService,
    smDatePickerLocalizationService,
    whiteboardSurgeryService,
    whiteboardSurgeryRoomReservationDialogService
) {
    var ctrl = this;
    var minuteRefreshHandler; // Refresh handler
    var previousDate; // Previous date before new check
    var isRefreshInterrupted = false;

    ctrl.selectedDate = moment(); // Current date as selected date by default
    ctrl.availableRooms = config.whiteboardSurgery.operationRooms; // All available rooms according to the config
    ctrl.companyId = sessionService.user.companyId; // Current companyId

    ctrl.runningAppointment; // Running appointment
    ctrl.nextAppointment; // Next appointment

    // Public methods
    ctrl.goToDashboard = goToDashboard;
    ctrl.goToSurgeryOverview = goToSurgeryOverview;
    ctrl.addNewRoomReservation = addNewRoomReservation;
    ctrl.onRoomReservationsChanged = onRoomReservationsChanged;

    // Events
    ctrl.$onInit = onInit;
    ctrl.$onDestroy = onDestroy;

    $rootScope.$on(whiteboardSurgeryService.SURGERYBOARD_REFRESH_EVENT, function (event, data) {
        if (data && data.refreshEnabled) {
            isRefreshInterrupted = false;
            _checkForNewDataToLoad();
            _initializeInterval();
        } else {
            isRefreshInterrupted = true;
            _destroyInterval();
        }
    });

    // ------------------------------------------------

    /**
     * Initialize the page
     */
    function onInit() {
        if ($stateParams.date) {
            ctrl.selectedDate = moment($stateParams.date);
        }

        smDatePickerLocalizationService.setTranslation();

        ctrl.selectedDateForDatePicker = new Date(ctrl.selectedDate);

        $scope.$watch("$ctrl.selectedDateForDatePicker", function (newValue, oldValue) {
            if (newValue && newValue !== oldValue) {
                _reloadWithDifferentDate(newValue);
            }
        });

        _setupCalendar();
    }

    function _reloadWithDifferentDate(date) {
        $state.go('whiteboardSurgeryRoom', { 'roomName': ctrl.roomName, date: moment(date).format('YYYY-MM-DD') });
    }

    function _setupCalendar() {
        ctrl.isLoading = true;
        ctrl.roomName = $stateParams.roomName;
        ctrl.appointmentId = $stateParams.appointmentId;

        _setSelectedDateIsToday();

        if (ctrl.roomName && _.indexOf(ctrl.availableRooms[ctrl.companyId], ctrl.roomName) >= 0) {
            _loadCalendarEvents();
            if (!ctrl.appointmentId) {
                _initializeInterval();
            }
        } else {
            ctrl.isLoading = false;
        }
    }

    /**
     * Destroy interval before leaving the component
     */
    function onDestroy() {
        _destroyInterval();
    }

    /**
     * Navigate to the dashboard
     */
    function goToDashboard() {
        $state.go('mycockpit');
    }

    /**
     * Navigate to the surgery overview
     */
    function goToSurgeryOverview() {
        $state.go('whiteboardSurgery', { 'date': moment(ctrl.selectedDate).format('YYYY-MM-DD') });
    }

    /**
     * Open dialog to add new room reservation
     */
    function addNewRoomReservation() {
        whiteboardSurgeryRoomReservationDialogService.addRoomReservation({
            companyId: ctrl.companyId, 
            roomName: ctrl.roomName,
            selectedDate: ctrl.selectedDate
        }).then(({actionType, reservation}) => {
            if (!_.isNil(reservation) && !_.isNil(reservation.room)) {
                whiteboardSurgeryService.createRoomReservation(reservation)
                .then(success => {
                    // show success notification
                    logger.success($translate.instant('whiteboardSurgery.SUCCESS_ON_RESERVATION_ACTION', { ACTION: 'CREATE' }), false);

                    // update (re-render) list of reservations
                    _loadRoomReservations();
                })
                .catch(error => {
                    // show error notification
                    logger.success($translate.instant('whiteboardSurgery.ERROR_ON_RESERVATION_ACTION', { ACTION: 'CREATE' }), false);
                });
            }
        });
    }

    function onRoomReservationsChanged() {
        _loadRoomReservations();
    }

    /**
     * Reload current date if needed and reload appointments if day changes
     */
    function _checkForNewDataToLoad() {
        _setSelectedDateIsToday();
        if (ctrl.selectedDateIsToday) {
            previousDate = moment(ctrl.selectedDate);
            ctrl.selectedDate = moment();
            if ((moment(previousDate).startOf('day').diff(moment(ctrl.selectedDate).startOf('day'), 'days') != 0)) {
                _loadCalendarEvents();
            } else if (ctrl.room) {
                _isAppointmentRunning();
            }
        }
    }

    /**
     * Destroy the refresh interval
     */
    function _destroyInterval() {
        if (!_.isUndefined(minuteRefreshHandler)) {
            $interval.cancel(minuteRefreshHandler);
            minuteRefreshHandler = undefined;
        }
    }

    /**
     * Initialize the refresh interval
     */
    function _initializeInterval() {
        if (_.isUndefined(minuteRefreshHandler)) {
            const secondsUntilNextInterval = 60 - moment().seconds();
            $timeout(_setRefreshInterval, secondsUntilNextInterval * 1000);
        }
    }

    function _isAppointmentRunning() {
        whiteboardSurgeryService.getAppointmentStatusList(ctrl.companyId, ctrl.room).then((rooms) => {
            const room = _.find(rooms, ['roomName', ctrl.roomName]);
            let operationLiveAppointment = undefined;
            let upcomingAppointment = undefined;
            _.each(ctrl.room[ctrl.roomName], (appointment) => {
                appointment.operationLive = appointment.appoint_id === room.operationLive;
                appointment.upcoming = appointment.appoint_id === room.upcomingAppointment;
                appointment.appointmentsInProgress = _.indexOf(room.appointmentsInProgress, appointment.appoint_id) >= 0;

                if (ctrl.appointmentId && appointment.appoint_id == _.toNumber(ctrl.appointmentId)) {
                    operationLiveAppointment = appointment;
                    appointment.isSelected = true;
                }
                if (!operationLiveAppointment && appointment.operationLive) {
                    operationLiveAppointment = appointment;
                }
                if (!upcomingAppointment && appointment.upcoming) {
                    upcomingAppointment = appointment;
                }
            });
            ctrl.runningAppointment = operationLiveAppointment;
            ctrl.nextAppointment = upcomingAppointment;
        });
    }

    /**
     * Load the calendar events according to the selected day
     */
    function _loadCalendarEvents() {
        // appointments
        const appointmentParams = {
            companyId: ctrl.companyId,
            limit: 10000,
            offset: 0,
            fromDate: ctrl.selectedDate.format('YYYY-MM-DD'),
            toDate: ctrl.selectedDate.format('YYYY-MM-DD')
        };
        appointmentService.getAppointmentsGroupedByDate(appointmentParams, 'location').then(data => {
            _prepareAppointmentData(data);
        });

        // room reservations
        _loadRoomReservations();
    }

    /**
     * Prepare the appointment data to have the structure how they should be displayed
     * @param {*} data
     */
    function _prepareAppointmentData(data) {
        var roomsGrouped = _.groupBy(data, 'firstlocation');
        ctrl.room = {};
        ctrl.room[ctrl.roomName] = roomsGrouped[ctrl.roomName];
        ctrl.isLoading = false;
        _isAppointmentRunning();
    }

    /**
     * Set the refresh interval
     */
    function _setRefreshInterval() {
        if (!isRefreshInterrupted) {
            _checkForNewDataToLoad();
            minuteRefreshHandler = $interval(_checkForNewDataToLoad, (config.whiteboardSurgery.autoRefreshInterval * 1000));
        }
    }

    /**
     * Set if the selected date is today, but only if it's not already set.
     */
    function _setSelectedDateIsToday() {
        if (_.isUndefined(ctrl.selectedDateIsToday)) {
            ctrl.selectedDateIsToday = (moment().startOf('day').diff(moment(ctrl.selectedDate).startOf('day'), 'days') === 0);
        }
    }

    /** ------------------------------------------------------------------------------------------
     *                                     Room Reservations
     *  ------------------------------------------------------------------------------------------ */
    function _loadRoomReservations() {
        const eventParams = {
            companyId: ctrl.companyId,
            rooms: [ctrl.roomName],
            from: moment(ctrl.selectedDate).startOf('day').toDate(),
            to: moment(ctrl.selectedDate).endOf('day').toDate()
        };
        whiteboardSurgeryService.getRoomReservations(eventParams).then(data => {
            ctrl.roomReservations = _prepareRoomsReservationsData(data);
        })
    }

    /**
     * Prepare the room reservations data to have the structure how they should be displayed
     * @param {*} data
     */
    function _prepareRoomsReservationsData(data) {
        var roomsGrouped = _.groupBy(data, 'room');
        let roomToDisplay = {};
        roomToDisplay[ctrl.roomName] = roomsGrouped[ctrl.roomName];
        return roomToDisplay ? roomToDisplay : {};
    }

}

export default WhiteboardSurgeryRoom;
