// jscs:disable requireParenthesesAroundIIFE

import templateVisit from './visit-page.html';
import templateVisitList from './visits.html';

run.$inject = ['fecNavigationContextService', 'routerService', 'config', '$filter'];

/* @ngInject */
function run(fecNavigationContextService, routerService) {
    routerService.configureStates(getStates(fecNavigationContextService));
}

function getStates(fecNavigationContextService) {
    return [
        {
            state: 'visit',
            config: {
                parent: 'layoutPatient',
                url: '/visits/:vnb?field',
                templateUrl: templateVisit,
                controller: 'VisitController',
                controllerAs: 'vm',
                redirectTo: 'visit.details',
                titleI18n: 'visit.TITLE',
                navigationTitle: 'visit.NAVIGATION_TITLE',
                requiredParameters: ['patientId', 'visitId'],
                requiredTranslationParts: ['guarantor', 'icdChop', 'invoice', 'patient', 'policy', 'servicefee', 'visit', 'medlab', 'notes', 'reporting']
            }
        },
        {
            state: 'visit.details',
            config: {
                url: '/details',
                titleI18n: 'visit.VISIT_DET',
                component: 'fecVisit',
                navigationTitle: 'visit.NAVIGATION_TITLE',
                requiredTranslationParts: ['guarantor', 'icdChop', 'invoice', 'patient', 'policy', 'servicefee', 'visit', 'medlab', 'notes', 'reporting']
            }
        },
        {
            state: 'visit.icdChopList',
            config: {
                url: '/icdchops',
                component: 'fecIcdchop',
                titleI18n: 'icdChop.TITLE_LIST',
                navigationTitle: 'visit.NAVIGATION_TITLE',
                requiredTranslationParts: ['icdChop', 'visit']
            }
        },
        {
            state: 'visit.servicefeeList',
            config: {
                url: '/servicefees',
                component: 'fecServicefees',
                titleI18n: 'servicefee.TITLE_LIST',
                navigationTitle: 'visit.NAVIGATION_TITLE',
                requiredTranslationParts: ['servicefee', 'visit']
            }
        },
        {
            state: 'visit.guarantorList',
            config: {
                url: '/guarantors',
                component: 'fecGuarantors',
                titleI18n: 'guarantor.TITLE_LIST',
                navigationTitle: 'visit.NAVIGATION_TITLE',
                requiredTranslationParts: ['policy', 'guarantor', 'servicefee', 'icdChop', 'invoice', 'visit']
            }
        },
        {
            state: 'visitList',
            config: {
                parent: 'layoutPatient',
                url: '/patients/:pid/visits',
                templateUrl: templateVisitList,
                controller: 'VisitsController',
                controllerAs: 'vm',
                titleI18n: 'visit.TITLE_LIST',
                navigationTitle: 'visit.NAVIGATION_TITLE',
                requiredTranslationParts: ['guarantor', 'icdChop', 'invoice', 'patient', 'policy', 'servicefee', 'visit', 'medlab', 'notes', 'reporting']
            }
        }
    ];
}

export default run;
