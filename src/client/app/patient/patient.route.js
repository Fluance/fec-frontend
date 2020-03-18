// jscs:disable requireParenthesesAroundIIFE
import templatePatient from './patient.html';

run.$inject = ['fecNavigationContextService', 'routerService'];

/* @ngInject */
function run(fecNavigationContextService, routerService) {
    routerService.configureStates([
        {
            state: 'patient',
            config: {
                parent: 'layoutPatient',
                url: '/patients/:pid?'+
                'field&' +
                'name&' +
                'firstname&' +
                'birthdate&' +
                'admissionstatus&'+
                'maidenname&'+
                'companyid&'+
                'hospservice&'+
                'patientunit&'+
                'patientbed&'+
                'admitdt&',
                templateUrl: templatePatient,
                controller: 'PatientController',
                controllerAs: 'vm',
                titleI18n: 'patient.TITLE',
                navigationTitle: 'patient.NAVIGATION_TITLE',
                requiredParameters: ['patientId'],
                requiredTranslationParts: ['patient', 'accessLog', 'appointment', 'guarantor', 'imaging', 'lab', 'notes', 'search', 'visit', 'reporting', 'prescription']
            }
        }
    ]);
}

export default run;
