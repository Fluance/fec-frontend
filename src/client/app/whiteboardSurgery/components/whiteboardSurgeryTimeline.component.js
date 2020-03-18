import _ from 'lodash';
import moment from 'moment';
import template from './whiteboardSurgeryTimeline.component.html';

const WhiteboardSurgeryTimeline = {
    bindings: {
        rooms: '<?',
        roomsReservations: '<?',
        selectedDate: '<?',
        companyId: '<?',
        roomName: '<?',
        onRoomReservationsChanged: '&?'
    },
    controller: controller,
    templateUrl: template
};

controller.$inject = [
    '$stateParams',
    '$timeout',
    '$rootScope',
    'config',
    'waitForRendering',
    'whiteboardSurgeryService'
];

function controller(
    $stateParams,
    $timeout,
    $rootScope,
    config,
    waitForRendering,
    whiteboardSurgeryService
) {
    var ctrl = this;

    var userScrolled = false; // Flag if user scrolled
    var scrolledBySystem = false; // Flag if system scrolled

    var autoScrollTimerPromise; // Promise to be able to cancel the autoscroll timeout
    var secondsUntilAutoScrollCheck = !_.isUndefined(config.whiteboardSurgery) && !_.isUndefined(config.whiteboardSurgery.autoScrollResetTime) ? config.whiteboardSurgery.autoScrollResetTime : 180;

    ctrl.todayDate = moment(); // Today Date
    ctrl.timelineLiveStyle = { 'top': '0px' }; // CSS Styles for the live timeline line
    ctrl.timelineLiveArrowStyle = { 'top': '0px' }; // CSS Styles for the live timeline arrow

    ctrl.isRefreshActive = true; // Activate refresh

    // Events
    ctrl.$onChanges = onChanges;
    ctrl.$onInit = onInit;
    ctrl.$onDestroy = onDestroy;

    $rootScope.$on(whiteboardSurgeryService.SURGERYBOARD_REFRESH_EVENT, function (event, data) {
        if (data && data.refreshEnabled) {
            ctrl.isRefreshActive = true;
            ctrl.selectedDateIsToday = undefined;
            _refreshSelectedDate();
        } else {
            ctrl.isRefreshActive = false;
        }
    });

    // ------------------------------------------------

    /**
     * Set the timeline styles as soon as the date changes
     * @param {*} changes
     */
    function onChanges(changes) {
        if (changes && changes.selectedDate && changes.selectedDate.currentValue && ctrl.isRefreshActive) {
            waitForRendering.wait(() => {
                ctrl.selectedDateIsToday = undefined;
                _refreshSelectedDate();
            });
        }
    }

    /**
     * Destroy scroll event before leaving the component
     */
    function onDestroy() {
        _stopScrollEvent();
    }

    /**
     * Initialize the scroll event
     */
    function onInit() {
        waitForRendering.wait(() => {
            _startScrollEvent();
        });
    }

    /**
     * Load and apply the live time line and scroll the calendar
     */
    function _loadMinutesSelectedDay() {
        const hours = ctrl.todayDate.hours();
        let minutes = ctrl.todayDate.minutes() + (60 * hours);
        ctrl.timelineLiveStyle['top'] = minutes + 'px';
        ctrl.timelineLiveArrowStyle['top'] = (minutes - 7) + 'px';

        if ($stateParams.appointmentId) {
            const rooms = Object.keys(ctrl.rooms);
            const appointments = ctrl.rooms[rooms[0]];
            const selectedAppointment = _.find(appointments, (appointment) => { return $stateParams.appointmentId == appointment.appoint_id; });
            if (selectedAppointment) {
                minutes = (moment(selectedAppointment.begindt).hours() * 60) + moment(selectedAppointment.begindt).minutes();
            }
        }

        _scrollToCenterOfTheCalendar(minutes);
    }

    /**
     * Stop the auto scroll as soon as the user has scrolled once
     */
    function _onScroll() {
        if (!scrolledBySystem) {
            userScrolled = true;
            _restartAutoScrollTimer();
        } else {
            scrolledBySystem = false;
        }
    }

    /**
     * Refresh everything which is related to the current time
     */
    function _refreshSelectedDate() {
        if (_.isUndefined(ctrl.selectedDateIsToday)) {
            ctrl.selectedDateIsToday = (moment().startOf('day').diff(moment(ctrl.selectedDate).startOf('day'), 'days') === 0);
            if (!ctrl.selectedDateIsToday) {
                _stopScrollEvent();
            }
        }
        ctrl.todayDate = moment();
        if (ctrl.selectedDateIsToday) {
            _loadMinutesSelectedDay();
        }
    }

    /**
     * Restart the autoscroll event
     */
    function _restartAutoScroll() {
        userScrolled = false;
        _loadMinutesSelectedDay();
    }

    /**
     * Restart the autoscroll timer
     */
    function _restartAutoScrollTimer() {
        if (autoScrollTimerPromise) {
            $timeout.cancel(autoScrollTimerPromise);
        }
        autoScrollTimerPromise = $timeout(_restartAutoScroll, secondsUntilAutoScrollCheck * 1000);
    }

    /**
     * Scroll to the calendar middle, if the user didn't scrolled the calendar himself
     * @param {*} minutes
     */
    function _scrollToCenterOfTheCalendar(minutes) {
        if (!userScrolled) {
            var body = document.getElementById('whiteboard-surgery-content-body');
            if (body) {
                const scrollTo = minutes - (body.offsetHeight / 2);
                if (scrollTo > 0 && body.scrollTop != undefined) {
                    scrolledBySystem = true;
                    body.scrollTop = scrollTo;
                }
            }
        }
    }

    /**
     * Start the scroll event listener
     */
    function _startScrollEvent() {
        angular.element(document.getElementById('whiteboard-surgery-content-body')).on('scroll', _onScroll);
    }

    /**
     * Stop the scroll event listener
     */
    function _stopScrollEvent() {
        angular.element(document.getElementById('whiteboard-surgery-content-body')).off('scroll', _onScroll);
    }
}

export default WhiteboardSurgeryTimeline;
