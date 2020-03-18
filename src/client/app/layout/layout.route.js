// jscs:disable requireParenthesesAroundIIFE
import template from './patientNavigation/patientNavigation.html';

run.$inject = ['routerService'];

/* @ngInject */
function run(routerService) {
    routerService.configureStates(getStates());
}

function getStates() {
    return [
        {
            state: 'layoutPatient',
            config: {
                abstract: true,
                templateUrl: template,
                controller: 'PatientNavigationController',
                controllerAs: 'ctrl',
                params: {
                    originState: null,
                    originParams: {
                        visitId: null,
                        appointmentId: null,
                        roomName: null
                    }
                },
                requiredTranslationParts: ['layout', 'layout.patientNavigation']
            }
        }
        // {
        //     state: 'layoutPatient',
        //     config: {
        //         abstract: true,
        //         templateUrl: 'app/layout/layoutPatient/layoutPatient.html',
        //         controller: 'LayoutPatientController',
        //         controllerAs: 'vm',
        //         requiredTranslationParts: ['layout', 'layout.layoutPatient']
        //     }
        // }
    ];
}

export default run;
