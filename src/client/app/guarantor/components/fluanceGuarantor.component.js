import template from './fluanceGuarantor.component.html';

const fluanceGuarantor = {
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
    'dataservice.guarantors',
    'dataservice.invoices',
    'logger'
];

function controller($scope, $translate, dataserviceGuarantor, dataserviceInvoices, logger) {
    var vm = this;
    vm.displayDetails = displayDetails;

    function displayDetails() {
        // Notify guarantor state changed
        onStateChanged();

        // Load details when expanded
        if (vm.result.isExpanded) {
            vm.result.isLoadingDetails = true;
            getGuarantor()
                .catch(function (exception) {
                    displayDetails();
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
        return dataserviceGuarantor
            .getGuarantorDetails(vm.result.vnb, vm.result.guarantor['guarantor_id'])
            .then(function (guarantordetails) {
                vm.result.details = guarantordetails;
            });
    }

    function onStateChanged() {
        $scope.$emit('fluance-guarantor.stateChanged', {
            isExpanded: vm.result.isExpanded,
            hasDetails: angular.isObject(vm.result.details)
        });
    }
}

export default fluanceGuarantor;
