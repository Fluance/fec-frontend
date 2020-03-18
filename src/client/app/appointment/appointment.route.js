// jscs:disable requireParenthesesAroundIIFE
import templateAppointment from './appointment-page.html';
import templateApointmentList from './appointmentList.html';

run.$inject = ['routerService'];

/* @ngInject */
function run(routerService) {
    routerService.configureStates(getStates());
}

function getStates() {
    return [
        {
            state: 'appointment',
            config: {
                parent: 'layoutPatient',
                url: '/appointments/:aid',
                templateUrl: templateAppointment,
                controller: 'AppointmentController',
                controllerAs: 'vm',
                redirectTo: 'appointment.details',
                titleI18n: 'appointment.TITLE',
                navigationTitle: 'appointment.NAVIGATION_TITLE',
                requiredParameters: ['patientId', 'appointmentId'],
                requiredTranslationParts: ['appointment', 'patient', 'visit']
            }
        },
        {
            state: 'appointment.details',
            config: {
                url: '/details',
                component: 'fecAppointment',
                titleI18n: 'appointment.TITLE_DETAILS',
                navigationTitle: 'appointment.NAVIGATION_TITLE',
                requiredTranslationParts: ['guarantor', 'icdChop', 'invoice', 'patient', 'policy', 'servicefee', 'visit', 'medlab', 'notes', 'reporting', 'whiteboardSurgery']
            }
        },
        {
            state: 'appointmentList',
            config: {
                parent: 'layoutPatient',
                url: '/patients/:pid/appointments',
                templateUrl: templateApointmentList,
                controller: 'AppointmentListController',
                controllerAs: 'vm',
                titleI18n: 'appointment.TITLE_LIST',
                navigationTitle: 'appointment.NAVIGATION_TITLE',
                requiredParameters: ['patientId'],
                requiredTranslationParts: ['appointment', 'patient', 'visit']
            }
        }
    ];
}

export default run;
