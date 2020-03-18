// jscs:disable requireParenthesesAroundIIFE

import templateServiceFee from './servicefee.html';
import templateServiceFeeList from './servicefeeList.html';

run.$inject = ['routerService'];

/* @ngInject */
function run(routerService) {
    routerService.configureStates(getStates());
}

function getStates() {
    return [
        {
            state: 'servicefee',
            config: {
                parent: 'layoutPatient',
                url: '/servicefees/:bid',
                templateUrl: templateServiceFee,
                controller: 'ServiceFeeController',
                controllerAs: 'vm',
                titleI18n: 'servicefee.TITLE',
                requiredTranslationParts: ['servicefee', 'patient', 'visit']
            }
        },
        {
            state: 'servicefeeList',
            config: {
                parent: 'layoutPatient',
                url: '/visits/:vnb/servicefees/deprecated',
                templateUrl: templateServiceFeeList,
                controller: 'ServiceFeeListController',
                controllerAs: 'vm',
                titleI18n: 'servicefee.TITLE_LIST',
                requiredTranslationParts: ['servicefee', 'patient', 'visit']
            }
        }
    ];
}

export default run;
