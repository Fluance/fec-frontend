// jscs:disable requireParenthesesAroundIIFE

InvoiceController.$inject = [
    '$stateParams',
    '$timeout',
    'dataservice.invoices',
    '$translate',
    'logger',
    //'LayoutPatientContextBox',
    //'tutorialService',
    '$filter'
];

/* @ngInject */
function InvoiceController($stateParams, $timeout, dataserviceInvoice,
    $translate, logger, $filter) {

    /*jshint validthis: true */
    var vm = this;
    vm.title = 'InvoiceController';

    vm.invoiceId = $stateParams.invoiceid;

    vm.result = null;

    // Populate our scope (as vm)
    $.extend(vm, {
        singleResultSearch: false, // Is single result page
        isComplete: false,
        isEmpty: false
    });

    vm.displayDetails = displayDetails;

    activate();

    function activate() {
        vm.result = {};
        getInvoice(vm.invoiceId);

        /*
        if (tutorialService.isActive()) {
            // Configure tutorials
            configureTutorial();
            tutorialService.current(vm.title);
        }*/
    }

    function displayDetails(invoiceId) {
        getInvoice(invoiceId)
            .catch(function(exception) {
                $translate('error.ERROR').then(function(translation) {
                    logger.error(translation, exception);
                });
            });
    }

    function getInvoice(iid) {
        return dataserviceInvoice
            .getInvoice(iid)
            .then(function(invoice) {
                vm.result.invoice = invoice;
                vm.result.details = invoice;
            });
    }

    function configureTutorial() {
        var contextBoxSteps = ContextBox.getTutorialSteps();
        var steps = [{
            element: '#btn-guarantors-invoices',
            introKey: 'invoice.GUIDE_GUARANTORS_INVOICES',
            position: 'floating'
        }];

        tutorialService.setSteps(vm.title, 0, contextBoxSteps.concat(steps));
    }
}

export default InvoiceController;
