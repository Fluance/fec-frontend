import templateGuarantor from './guarantor.html';
import templateGuarantorList from './guarantors.html';

run.$inject = ['routerService'];

/* @ngInject */
function run(routerService) {
    routerService.configureStates(getStates());
}

function getStates() {
    return [
        {
            state: 'guarantor',
            config: {
                parent: 'layoutPatient',
                url: '/visits/:vnb/guarantors/:gid',
                templateUrl: templateGuarantor,
                controller: 'GuarantorController',
                controllerAs: 'vm',
                titleI18n: 'guarantor.TITLE'
            }
        },
        {
            state: 'guarantorList',
            config: {
                parent: 'layoutPatient',
                url: '/visits/:vnb/guarantors/deprecated',
                templateUrl: templateGuarantorList,
                controller: 'GuarantorsController',
                controllerAs: 'vm',
                titleI18n: 'guarantor.TITLE_LIST'
            }
        }
    ];
}

export default run;
