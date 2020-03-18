import userTemplate from './user/user.html';
import serviceDiscoveryTemplate from './serviceDiscovery.html';

run.$inject = ['routerService'];

/* @ngInject */
function run(routerService) {
    routerService.configureStates(getStates());
}

function getStates() {
    return [
        {
            state: 'settings',
            config: {
                url: '/settings',
                templateUrl: userTemplate,
                controller: 'UserController',
                controllerAs: 'vm',
                titleI18n: 'settings.SETTINGS',
                settings: {
                    i18n: 'SETTINGS',
                    content: 'user'
                },
                requiredTranslationParts: ['admin', 'settings', 'search', 'patient', 'visit']
            }
        }, {
            state: 'serviceDiscovery',
            config: {
                url: '/service-discovery',
                templateUrl: serviceDiscoveryTemplate,
                controller: 'ServiceDiscoveryController',
                controllerAs: 'vm',
                titleI18n: 'settings.SERVICE_DISCOVERY',
                preventPageScrolling: true,
                requiredTranslationParts: ['settings'],
                accessControl: {
                    allowAnonymous: true
                }
            }

        }
    ];
}

export default run;
