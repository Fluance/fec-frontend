
const NavButtonPolicyList = {
    bindings: {
        vnb: '<',
        isEnabled: '<?'
    },
    controller: ['$q', 'dataservice.visits', controller],
    template: '<fec-nav-button text="{{\'policy.TITLE_LIST\' | translate}}" state="policyList" state-params="{vnb: $ctrl.vnb}" can-navigate="$ctrl.canNavigate()" is-enabled="$ctrl.isEnabled" />'
};

function controller($q, dataserviceVisits) {
    /*jshint validthis: true */
    var vm = this;
    vm.canNavigate = function () {
        if (vm.vnb) {
            return dataserviceVisits.hasPolicyData(vm.vnb)
                .then(function (result) {
                    return result;
                });
        }
        else {
            return $q.resolve(false);
        }
    };
}

export default NavButtonPolicyList;
