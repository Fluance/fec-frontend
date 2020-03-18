// jscs:disable requireParenthesesAroundIIFE
import templateDocument from './document.html';

run.$inject = ['routerService'];

/* @ngInject */
function run(routerService) {
    routerService.configureStates(getStates());
}

function getStates() {
    return [
        {
            state: 'patientDocuments',
            config: {
                parent: 'layoutPatient',
                url: '/patients/:pid/documents',
                templateUrl: templateDocument,
                controller: 'DocumentController',
                controllerAs: '$ctrl',
                titleI18n: 'document.TITLE_LIST',
                navigationTitle: 'document.NAVIGATION_TITLE',
                requiredParameters: ['patientId'],
                requiredTranslationParts: ['document']
            }
        }
    ];
}

export default run;
