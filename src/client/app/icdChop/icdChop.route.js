import template from './icdChop.html';

run.$inject = ['routerService'];

/* @ngInject */
function run(routerService) {
    routerService.configureStates(getStates());
}

function getStates() {
    return [
        {
            state: 'icdChopList',
            config: {
                parent: 'layoutPatient',
                url: '/visits/:vnb/icdchops/deprecated',
                templateUrl: template,
                controller: 'IcdChopController',
                controllerAs: 'vm',
                titleI18n: 'icdChop.TITLE_LIST',
                requiredTranslationParts: ['icdChop']
            }
        }
    ];
}

export default run;
