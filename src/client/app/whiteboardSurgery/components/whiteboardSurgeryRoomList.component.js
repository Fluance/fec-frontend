import _ from 'lodash';
import moment from 'moment';
import template from './whiteboardSurgeryRoomList.component.html';

const WhiteboardSurgeryRoomList = {
    bindings: {
        rooms: '<?',
        selectedDate: '<?'
    },
    controller: controller,
    templateUrl: template
};

controller.$inject = [
    '$state'
];

function controller(
    $state
) {
    var ctrl = this;

    ctrl.runningAppointments = {}; // Running appointments
    ctrl.nextAppointments = {}; // Next appointments

    ctrl.goToRoom = goToRoom;

    // Events
    ctrl.$onChanges = onChanges;
    ctrl.$onInit = onInit;

    // ------------------------------------------------

    function goToRoom(roomName) {
        $state.go('whiteboardSurgeryRoom', { 'roomName': roomName, date: moment(ctrl.selectedDate).format('YYYY-MM-DD') });
    }

    function onInit() {
        _setSelectedDateIsToday();
    }


    /**
     * Set the current operations as soon as the date or rooms changed
     * @param {*} changes
     */
    function onChanges(changes) {
        if (changes && changes.rooms && changes.rooms.currentValue) {
            ctrl.runningAppointment = {}; // Reset running appointment
            ctrl.nextAppointment = {}; // Reset next appointment
            _setSelectedDateIsToday();
            _setCurrentOperations();
        } else if (changes && changes.selectedDate && changes.selectedDate.currentValue) {
            ctrl.selectedDateIsToday = undefined;
            ctrl.runningAppointment = {}; // Reset running appointment
            ctrl.nextAppointment = {}; // Reset next appointment
            _setSelectedDateIsToday();
            _setCurrentOperations();
        }
    }

    /**
     * Set the running appointments and calculate and apply the appointment height and position
     * @param {*} rooms
     */
    function _setCurrentOperations() {
        _.each(ctrl.rooms, (room, index) => {
            let operationLiveAppointment = undefined;
            let upcomingAppointment = undefined;
            _.each(room, (appointment) => {
                if (!operationLiveAppointment && appointment.operationLive) {
                    operationLiveAppointment = appointment;
                }
                if (!upcomingAppointment && appointment.upcoming) {
                    upcomingAppointment = appointment;
                }
            });
            ctrl.runningAppointments[index] = operationLiveAppointment;
            ctrl.nextAppointments[index] = upcomingAppointment;
        });
    }

    /**
     * Set if the selected date is today, but only if it's not already set.
     */
    function _setSelectedDateIsToday() {
        ctrl.selectedDateIsToday = (moment().startOf('day').diff(moment(ctrl.selectedDate).startOf('day'), 'days') === 0);
    }
}

export default WhiteboardSurgeryRoomList;
