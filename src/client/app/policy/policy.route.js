// jscs:disable requireParenthesesAroundIIFE

import templatePolicy from './policy.html';
import templatePolicyList from './policies.html';

run.$inject = ['routerService'];

/* @ngInject */
function run(routerService) {
    routerService.configureStates(getStates());
}

function getStates() {
    return [
        {
            state: 'policyList',
            config: {
                parent: 'layoutPatient',
                url: '/visits/:vnb/policies',
                templateUrl: templatePolicyList,
                controller: 'PoliciesController',
                controllerAs: 'vm',
                titleI18n: 'policy.TITLE_LIST',
                requiredTranslationParts: ['policy']
            }
        },
        {
            state: 'policy',
            config: {
                parent: 'layoutPatient',
                url: '/visits/:vnb/policies/:gid/:priority/:subpriority',
                templateUrl: templatePolicy,
                controller: 'PolicyController',
                controllerAs: 'vm',
                titleI18n: 'policy.TITLE_LIST',
                requiredTranslationParts: ['policy']
            }
        }
    ];
}

export default run;
