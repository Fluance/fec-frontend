// jscs:disable requireParenthesesAroundIIFE

run.$inject = ['routerService'];

/* @ngInject */
function run(routerService) {
    routerService.configureStates(getStates());
}

function getStates() {
    return [
        {
            state: 'whiteboard',
            config: {
                url: '/whiteboard/:companyId/:hospService',
                component: 'fecWhiteboard',
                titleI18n: 'whiteboard.TITLE_SHORT',
                requiredParameters: ['patientId'],
                requiredTranslationParts: ['whiteboard', 'patient', 'visit']
            }
        }
    ];
}

export default run;
