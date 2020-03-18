import template from './fluanceInvoice.component.html';

const fluanceInvoice = {
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
    'dataservice.invoices',
    'logger'
];

function controller($scope, $translate, dataserviceInvoice, logger) {
    var vm = this;

    vm.displayDetails = displayDetails;

    function displayDetails() {
        if (vm.result.isExpanded) {
            vm.isDetailLoading = true;
            return getInvoice()
                .catch(function (exception) {
                    $translate('error.ERROR').then(function (translation) {
                        logger.error(translation, exception);
                    });
                })
                .finally(function () {
                    vm.isDetailLoading = false;
                });
        }
    }

    function getInvoice() {
        return dataserviceInvoice
            .getInvoice(vm.result.invoice.id)
            .then(function (invoice) {
                vm.result.details = invoice;
            });
    }
}

export default fluanceInvoice;
