// jscs:disable requireParenthesesAroundIIFE
import template from './accessLog.html';

run.$inject = ['routerService'];

/* @ngInject */
function run(routerService) {
    routerService.configureStates(getStates());
}

function getStates() {
    return [
        {
            state: 'patientAccessLogs',
            config: {
                parent: 'layoutPatient',
                url: '/patients/:pid/logs',
                templateUrl: template,
                controller: 'AccessLogController',
                controllerAs: 'vm',
                titleI18n: 'accessLog.TITLE_LIST',
                navigationTitle: 'accessLog.NAVIGATION_TITLE',
                requiredParameters: ['patientId'],
                requiredTranslationParts: ['accessLog']
            }
        }
    ];
}

export default run;
