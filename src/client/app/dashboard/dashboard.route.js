import template from './dashboard.html';

run.$inject = ['fecNavigationContextService', 'routerService', 'config', '$filter'];

/* @ngInject */
function run(fecNavigationContextService, routerService, config, $filter) {
    routerService.configureStates(getStates(fecNavigationContextService));
}

function getStates(fecNavigationContextService) {
    return [{
        state: 'mycockpit',
        config: {
            url: '/home',
            templateUrl: template,
            controller: 'DashboardController',
            titleI18n: 'dashboard.TITLE',
            settings: {
                nav: 1,
                i18n: 'MYCOCKPIT',
                content: 'home',
                mobilewarn: false
            },
            requiredTranslationParts: ['dashboard', 'shiftPatientList', 'lab', 'imaging', 'whiteboardSurgery']
        }
    }];
}


export default run;
