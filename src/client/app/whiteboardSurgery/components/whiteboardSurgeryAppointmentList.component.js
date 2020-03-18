import _ from 'lodash';
import moment from 'moment';
import template from './whiteboardSurgeryAppointmentList.component.html';

const WhiteboardSurgeryAppointmentList = {
    bindings: {
        appointments: '<?',
        selectedDate: '<?'
    },
    controller: controller,
    templateUrl: template
};

controller.$inject = [
    '$state',
    '$stateParams',
    'fecNavigationContextService'
];

function controller(
    $state,
    $stateParams,
    fecNavigationContextService
) {
    var ctrl = this;

    ctrl.DEFAULT_CODE_OCCUPATION_OPERATOR = 'Op';
    ctrl.DEFAULT_CODE_OCCUPATION_STAFF = 'OpAss';

    // Public methods
    ctrl.openAppointmentDetail = openAppointmentDetail;

    // Events
    ctrl.$onChanges = onChanges;

    // ------------------------------------------------

    /**
     * Open the detail view of the appointment
     * @param {*} appointment
     */
    function openAppointmentDetail(appointment) {
        const roomName = appointment.firstlocation;
        const appointmentId = appointment.appoint_id;

        $state.go('whiteboardSurgeryAppointmentDetail', { appointmentId: appointmentId, roomName: roomName, date: moment(ctrl.selectedDate).format('YYYY-MM-DD') });
    }

    /**
     * Style the appointments as soon as they change
     * @param {*} changes
     */
    function onChanges(changes) {
        if (changes && changes.appointments && changes.appointments.currentValue) {
            _.each(ctrl.appointments, appointment => {
                _calculateAppointmentStyle(appointment);
            });
        }
    }

    /**
     * Calculate and apply the height and position of the given appointment
     * @param {*} appointment
     */
    function _calculateAppointmentStyle(appointment) {
        const beginDate = moment(appointment.begindt);
        const endDate = moment(appointment.enddt);
        const isStartingOnSelectedDay = moment(ctrl.selectedDate).startOf('day').diff(moment(beginDate).startOf('day'), 'days') === 0;
        const isEndingOnSelectedDay = moment(ctrl.selectedDate).startOf('day').diff(moment(endDate).startOf('day'), 'days') === 0;

        // if not start today, start from 0
        const startTime = isStartingOnSelectedDay ? ((beginDate.hours() * 60) + beginDate.minutes()) : 0;

        // if not end today then 24*60 - startMinutes as duration
        const duration = isEndingOnSelectedDay ? ((endDate.hours() * 60) + endDate.minutes()) - startTime : ((24 * 60) - startTime);

        // Set start point
        appointment.time = startTime + 1;

        // Set duration
        appointment.duration = duration - 1;
    }
}

export default WhiteboardSurgeryAppointmentList;
