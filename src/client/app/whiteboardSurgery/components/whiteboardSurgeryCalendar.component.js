import _ from 'lodash';
import moment from 'moment';
import template from './whiteboardSurgeryCalendar.component.html';

const WhiteboardSurgeryCalendar = {
    bindings: {
        hideToolbar: '<?',
        hideNavigation: '<?',
        hideRooms: '<?',
        hideTimeline: '<?',
        hideInfos: '<?',
    },
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
    'config',
    'logger',
    'dataservice.appointments',
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
    config,
    logger,
    appointmentService,
    sessionService,
    smDatePickerLocalizationService,
    whiteboardSurgeryService,
    whiteboardSurgeryRoomReservationDialogService
) {
    var ctrl = this;
    var minuteRefreshHandler; // Refresh handler
    var previousDate; // Previous date before new check

    ctrl.selectedDateForDatePicker = new Date(); // Javascript date for the datetime picker
    ctrl.selectedDate = moment(); // Current date as selected date by default

    ctrl.roomsReservations = {}; // same structure as 'rooms', but with reservations

    // Public methods
    ctrl.goToDashboard = goToDashboard;
    ctrl.openEditNoteView = openEditNoteView;
    ctrl.addNewReservation = addNewReservation;
    ctrl.onRoomReservationsChanged = onRoomReservationsChanged;

    // Events
    ctrl.$onInit = onInit;
    ctrl.$onDestroy = onDestroy;

    $rootScope.$on(whiteboardSurgeryService.SURGERYBOARD_REFRESH_EVENT, function (event, data) {
        if (data && data.refreshEnabled) {
            _initializeInterval();
        } else {
            _destroyInterval();
        }
    });

    // ------------------------------------------------

    /**
     * Initialize the page
     */
    function onInit() {
        smDatePickerLocalizationService.setTranslation();

        ctrl.companyId = sessionService.user.companyId; // Too much external knowledge!...
        ctrl.availableRooms = config.whiteboardSurgery.operationRooms; // All available rooms according to the config
        ctrl.locationNames = ctrl.availableRooms[ctrl.companyId];

        $scope.$watch("$ctrl.selectedDateForDatePicker", function (newValue, oldValue) {
            if (newValue !== oldValue) {
                _initializeCalendar(newValue);
                _loadSurgeryboardAndCalendarEvents();
                _initializeInterval();
            }
        });

        if ($stateParams.date) {
            ctrl.selectedDateForDatePicker = new Date($stateParams.date);
            _initializeCalendar(ctrl.selectedDateForDatePicker);
        }

        _loadSurgeryboardAndCalendarEvents();
        _initializeInterval();
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
     * Navigate to the surgery note edit view
     */
    function openEditNoteView() {
        $state.go('whiteboardSurgeryNoteEdit', { 'date': moment(ctrl.selectedDate).format('YYYY-MM-DD') });
    }

    /**
     * Open dialog to add new room reservation
     */
    function addNewReservation() {
        whiteboardSurgeryRoomReservationDialogService.addRoomReservation({
                companyId: ctrl.companyId, 
                selectedDate: ctrl.selectedDateForDatePicker
            }).then(({actionType, reservation}) => {
            if (!_.isNil(reservation) && !_.isNil(reservation.room)) {
                whiteboardSurgeryService.createRoomReservation(reservation)
                .then(success => {
                    // show success notification
                    logger.success($translate.instant('whiteboardSurgery.SUCCESS_ON_RESERVATION_ACTION', { ACTION: 'CREATE' }), false);
                    
                    // update (re-render) reservations
                    _loadRoomsReservations();
                })
                .catch(error => {
                    // show error notification
                    logger.success($translate.instant('whiteboardSurgery.ERROR_ON_RESERVATION_ACTION', { ACTION: 'CREATE' }), false);
                });
            }
        });
    }

    function onRoomReservationsChanged() {
        _loadRoomsReservations();
    }

    /**
     * Reload current date if needed and reload appointments if day changes
     */
    function _checkForNewDataToLoad() {
        if (_.isUndefined(ctrl.selectedDateIsToday)) {
            ctrl.selectedDateIsToday = (moment().startOf('day').diff(moment(ctrl.selectedDate).startOf('day'), 'days') === 0);
        }

        if (ctrl.selectedDateIsToday) {
            previousDate = moment(ctrl.selectedDate);
            ctrl.selectedDate = moment();
            if ((moment(previousDate).startOf('day').diff(moment(ctrl.selectedDate).startOf('day'), 'days') != 0)) {
                _loadSurgeryboardAndCalendarEvents();
            } else {
                _loadSurgeryboard();
                _setAppointmentStatus(ctrl.rooms, ctrl.companyId);
                _loadRoomsReservations();
            }
        } else {
            _loadSurgeryboard();
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
     * Initialize the calendar
     */
    function _initializeCalendar(selectedDate) {
        ctrl.selectedDate = moment(selectedDate);
        ctrl.selectedDate.set({
            hour: moment().get('hour'),
            minute: moment().get('minute'),
            second: moment().get('second')
        });
        _destroyInterval();
        ctrl.selectedDateIsToday = undefined;
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

    /**
     * Load appointments according to the selected day
     */
    function _loadSurgeryboardAndCalendarEvents() {
        _loadSurgeryboard();

        //const companyId = sessionService.user.companyId;
        let eventParams = {
            companyId: ctrl.companyId,
            limit: 10000,
            offset: 0,
            fromDate: moment(ctrl.selectedDate).format('YYYY-MM-DD'),
            toDate: moment(ctrl.selectedDate).format('YYYY-MM-DD'),
            locationNames: ctrl.locationNames
        };

        // appointments
        appointmentService.getAppointmentsGroupedByDate(eventParams, 'location').then(data => {
            _prepareAppointmentData(data, ctrl.companyId);
        });

        // room reservations
        _loadRoomsReservations();
    }

    function _loadSurgeryboard() {
        whiteboardSurgeryService.getSurgeryboard({
            companyId: ctrl.companyId,
            date: moment(ctrl.selectedDate).format('YYYY-MM-DD')
        }).then((data) => {
            ctrl.surgeryboardNote = data;
        });
    }

    /**
     * Prepare the appointment data to have the structure how they should be displayed
     * @param {*} data
     */
    function _prepareAppointmentData(data, companyId) {
        var roomsGrouped = _.groupBy(data, 'firstlocation');
        var rooms = _.pick(roomsGrouped, ctrl.locationNames);
        var roomsToDisplay = {};
        _.each(ctrl.locationNames, room => {
            let roomToAdd = rooms[room];
            if (roomToAdd) {
                roomsToDisplay[room] = roomToAdd;
            } else {
                roomsToDisplay[room] = [];
            }
        });
        _setAppointmentStatus(roomsToDisplay, companyId);
    }

    function _setAppointmentStatus(roomsToDisplay, companyId) {
        whiteboardSurgeryService.getAppointmentStatusList(companyId, roomsToDisplay).then((rooms) => {
            _.each(rooms, (room) => {
                _.each(roomsToDisplay[room.roomName], (appointment) => {
                    appointment.operationLive = appointment.appoint_id === room.operationLive;
                    appointment.upcoming = appointment.appoint_id === room.upcomingAppointment;
                    appointment.appointmentsInProgress = _.indexOf(room.appointmentsInProgress, appointment.appoint_id) >= 0;
                });
            });
        }).finally(() => {
            ctrl.rooms = roomsToDisplay ? roomsToDisplay : {};
        });
    }

    /**
     * Prepare the rooms reservations data to have the structure how they should be displayed
     * @param {*} data
     */
    function _prepareRoomsReservationsData(data) {
        var roomsGrouped = _.groupBy(data, 'room');
        var rooms = _.pick(roomsGrouped, ctrl.locationNames);
        var roomsToDisplay = {};
        _.each(ctrl.locationNames, room => {
            let roomToAdd = rooms[room];
            if (roomToAdd) {
                roomsToDisplay[room] = roomToAdd;
            } else {
                roomsToDisplay[room] = [];
            }
        });
        return roomsToDisplay ? roomsToDisplay : {};
    }

    /**
     * Set the refresh interval
     */
    function _setRefreshInterval() {
        _checkForNewDataToLoad();
        minuteRefreshHandler = $interval(_checkForNewDataToLoad, (config.whiteboardSurgery.autoRefreshInterval * 1000));
    }

    /** ------------------------------------------------------------------------------------------
     *                                     Rooms Reservations
     *  ------------------------------------------------------------------------------------------ */
    function _loadRoomsReservations() {
        const eventParams = {
            companyId: ctrl.companyId,
            from: moment(ctrl.selectedDate).startOf('day').toDate(),
            to: moment(ctrl.selectedDate).endOf('day').toDate(),
            rooms: ctrl.locationNames
        };

        whiteboardSurgeryService.getRoomReservations(eventParams).then(data => {
            ctrl.roomsReservations = _prepareRoomsReservationsData(data);
        })
    }
}

export default WhiteboardSurgeryCalendar;
