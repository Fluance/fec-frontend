import template from './imaging.html';

run.$inject = ['routerService'];

/* @ngInject */
function run(routerService) {
    routerService.configureStates(getStates());
}

function getStates() {
    return [
        {
            state: 'imagingList',
            config: {
                parent: 'layoutPatient',
                url: '/patients/:pid/imagings',
                templateUrl: template,
                controller: 'ImagingController',
                controllerAs: 'vm',
                titleI18n: 'imaging.TITLE_LIST',
                navigationTitle: 'imaging.NAVIGATION_TITLE',
                requiredParameters: ['patientId'],
                requiredTranslationParts: ['imaging']
            }
        }
    ];
}

export default run;
