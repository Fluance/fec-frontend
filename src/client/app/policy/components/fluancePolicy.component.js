import angular from 'angular';
import template from './fluancePolicy.component.html';

const fluancePolicy = {
    bindings: {
        result: '='
    },
    controller: controller,
    controllerAs: 'vm',
    templateUrl: template
};

controller.$inject = [
    '$scope',
    '$translate',
    'dataservice.visits',
    'logger',
];

function controller($scope, $translate, dataServiceVisits, logger) {
    var vm = this;

    vm.displayDetails = displayDetails;

    function displayDetails() {

        // Notify visit state changed
        onStateChanged();

        // Load details when expanded
        if (vm.result.isExpanded) {
            vm.result.isLoadingDetails = true;
            return getGuarantor()
                .catch(function (exception) {
                    $translate('error.ERROR').then(function (translation) {
                        logger.error(translation, exception);
                    });
                })
                .finally(function () {
                    vm.result.isLoadingDetails = false;
                });
        }
    }

    function getGuarantor() {
        return dataServiceVisits
            .getPolicy({
                guarantorid: vm.result.policy.guarantorId,
                priority: vm.result.policy.priority,
                subpriority: vm.result.policy.subPriority,
                visitnb: vm.result.vnb
            })
            .then(function (guarantordetails) {
                vm.result.policyDetails = guarantordetails;
            });
    }

    function onStateChanged() {
        $scope.$emit('patient-policy.stateChanged', {
            isExpanded: vm.result.isExpanded,
            hasDetails: angular.isObject(vm.result.details)
        });
    }
}


export default fluancePolicy;
