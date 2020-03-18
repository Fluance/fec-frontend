import moment from 'moment';
import template from './fecPatientNavigationButtonWhiteboardSurgery.component.html';

const PatientNavigationButtonWhiteboardSurgery = {
    controller: ['$state', 'fecNavigationContextService', controller],
    templateUrl: template
};

function controller($state, fecNavigationContextService) {
    var ctrl = this;

    // state
    ctrl.isActive = true;
    ctrl.isEnabled = true;

    // ctrl.requiredContext = 'roomName';

    //methods
    ctrl.navigateTo = navigateTo;
    ctrl.canNavigate = canNavigate;

    // Events
    ctrl.$onInit = onInit;

    // API

    // ------------------------------------------------------- Event methods

    function onInit() {
        ctrl.context = fecNavigationContextService.getContext();
        ctrl.roomName = ctrl.context && ctrl.context.originParams && ctrl.context.originParams.roomName ? ctrl.context.originParams.roomName : null;
        ctrl.appointmentId = ctrl.context && ctrl.context.originParams && ctrl.context.originParams.appointmentId ? ctrl.context.originParams.appointmentId : null;
        ctrl.date = ctrl.context && ctrl.context.originParams && ctrl.context.originParams.date ? ctrl.context.originParams.date : null;
    }

    // ------------------------------------------------------- Methods

    /**
     * Navigate when user clicks the button
     */
    function navigateTo() {
        if (ctrl.roomName) {
            if (ctrl.appointmentId) {
                $state.go('whiteboardSurgeryAppointmentDetail', { 'roomName': ctrl.roomName, 'appointmentId': ctrl.appointmentId, 'date': moment(ctrl.date).format('YYYY-MM-DD') });
            } else {
                $state.go('whiteboardSurgeryRoom', { 'roomName': ctrl.roomName, 'date': moment(ctrl.date).format('YYYY-MM-DD') });
            }
        } else {
            $state.go('whiteboardSurgery', { 'date': moment(ctrl.date).format('YYYY-MM-DD') });
        }
    }

    /**
     * Check if the user can navigate
     */
    function canNavigate() {
        return true;
    }
}

export default PatientNavigationButtonWhiteboardSurgery;
