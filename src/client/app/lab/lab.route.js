// jscs:disable requireParenthesesAroundIIFE


run.$inject = ['routerService'];

/* @ngInject */
function run(routerService) {
    routerService.configureStates(getStates());
}

function getStates() {
    return [
        {
            state: 'labList',
            config: {
                parent: 'layoutPatient',
                url: '/patients/:pid/labs',
                component: 'fecLab',
                titleI18n: 'lab.TITLE_SHORT',
                navigationTitle: 'lab.NAVIGATION_TITLE',
                requiredParameters: ['patientId'],
                requiredTranslationParts: ['lab', 'medlab']
            }
        }
    ];
}

export default run;
