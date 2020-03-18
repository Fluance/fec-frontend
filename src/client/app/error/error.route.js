import templateError from './error.html';
import templateMaintenance from './maintenance.html';

run.$inject = ['routerService'];

/* @ngInject */
function run(routerService) {
    routerService.configureStates(getStates());
}

function getStates() {
    return [
        {
            state: 'error',
            config: {
                url: '/error/:errorCode?{errorParams:json}',
                templateUrl: templateError,
                controller: 'ErrorController',
                controllerAs: 'vm',
                titleI18n: 'error.ERROR',
                requiredTranslationParts: ['error'],
                accessControl: {
                    allowAnonymous: false
                }
            }
        },
        {
            state: 'maintenance',
            config: {
                url: '/maintenance',
                templateUrl: templateMaintenance,
                controllerAs: 'vm',
                darkBackground: true,
                noHamburger: true,
                titleI18n: 'error.TITLE_MAINTENANCE',
                requiredTranslationParts: ['error'],
                accessControl: {
                    allowAnonymous: true
                }
            }
        }
    ];
}

export default run;
