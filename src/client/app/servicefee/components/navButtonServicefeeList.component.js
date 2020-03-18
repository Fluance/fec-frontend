import _ from 'lodash';

const NavButtonBenefitList = {
    bindings: {
        vnb: '<',
        state: '@?',
        isEnabled: '<?',
        navName: '@?'
    },
    controller: ['$q', 'dataservice.servicefees', controller],
    template: '<fec-nav-button text="{{\'servicefee.TITLE_LIST\' | translate}}" state="{{$ctrl.state}}" state-params="{vnb: $ctrl.vnb}" can-navigate="$ctrl.canNavigate()" is-enabled="$ctrl.isEnabled" nav-name="{{$ctrl.navName}}""/>'
};

function controller($q, dataserviceBenefits) {
    /*jshint validthis: true */
    var vm = this;

    vm.$onInit = onInit;
    vm.canNavigate = canNavigate;

    // ------------------------------------------------------------------------------------

    function onInit() {
        vm.state = (!_.isUndefined(vm.state)) ? vm.state : 'servicefeeList';
    }

    function canNavigate() {
        if (vm.vnb) {
            var params = {
                vnb: vm.vnb
            };
            return dataserviceBenefits.hasServiceFeeData(params)
                .then(function (result) {
                    return result;
                });
        }
        else {
            return $q.resolve(false);
        }
    }
}

export default NavButtonBenefitList;

