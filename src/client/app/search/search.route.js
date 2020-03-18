// jscs:disable requireParenthesesAroundIIFE
import templateFullSearch from './fullSearch.html';
import templateFullSearchEntityType from './fullSearchEntityType.html';
import templateSearchPatient from './searchPatients.html';

run.$inject = ['routerService'];

/* @ngInject */
function run(routerService) {
    routerService.configureStates(getStates());
}

function getStates() {
    return [{
            state: 'fullSearch',
            config: {
                url: '/search/full?field',
                templateUrl: templateFullSearch,
                controller: 'fullSearchController',
                controllerAs: '$ctrl',
                titleI18n: 'search.TITLE',
                requiredTranslationParts: ['notes', 'guarantor', 'icdChop', 'invoice', 'patient', 'policy', 'servicefee', 'visit', 'medlab', 'accessLog', 'appointment', 'guarantor', 'imaging', 'lab', 'search']
            }
        },
        {
            state: 'fullSearchEntityType',
            config: {
                url: '/search/full/:type?field',
                templateUrl: templateFullSearchEntityType,
                controller: 'fullSearchEntityTypeController',
                controllerAs: '$ctrl',
                titleI18n: 'search.TITLE',
                requiredTranslationParts: ['notes', 'guarantor', 'icdChop', 'invoice', 'patient', 'policy', 'servicefee', 'visit', 'medlab', 'accessLog', 'appointment', 'guarantor', 'imaging', 'lab', 'search']
            }
        },
        {
            state: 'searchpatient',
            config: {
                url: '/search/patients?' +
                    'pid&' +
                    'vnb&' +
                    'name&' +
                    'firstname&' +
                    'birthdate&' +
                    'admissionstatus&' +
                    'orderby&' +
                    'sortorder&' +
                    'companyid&' +
                    'hospservice&' +
                    'patientunit&' +
                    'patientroom&' +
                    'patientbed&' +
                    'admitdt&' +
                    'offset&' +
                    'maidenname',
                templateUrl: templateSearchPatient,
                controller: 'searchPatientsController',
                controllerAs: '$ctrl',
                titleI18n: 'search.TITLE_PATIENTS',
                requiredTranslationParts: ['notes', 'patient', 'accessLog', 'appointment', 'guarantor', 'imaging', 'lab', 'search', 'visit']
            }
        }
    ];
}

export default run;
