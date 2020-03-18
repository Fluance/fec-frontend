// jscs:disable requireParenthesesAroundIIFE
import _ from 'lodash';

InvoicesController.$inject = [
    '$stateParams',
    //'LayoutPatientContextBox',
    'dataPager',
    'dataservice.invoices',
    //'tutorialService',
    'layoutService'
];

/* @ngInject */
function InvoicesController($stateParams, DataPager, dataserviceInvoice, layoutService) {

    /*jshint validthis: true */
    var vm = this;
    vm.title = 'InvoicesController';

    vm.vnb = ($stateParams.guarantorid) ? parseInt($stateParams.vnb) : 0;
    if (isNaN(vm.vnb)) { vm.vnb = 0; }

    vm.guarantorId = ($stateParams.guarantorid) ? parseInt($stateParams.guarantorid) : 0;
    if (isNaN(vm.guarantorId)) { vm.guarantorId = 0; }

    // Sort options
    vm.sortCriteria = dataserviceInvoice.sortCriteria;
    var DEFAULT_SORT_CRITERIA = ($stateParams.orderby) ? $stateParams.orderby : (vm.sortCriteria.length > 0) ? vm.sortCriteria[0].key : undefined;
    var DEFAULT_SORT_DIRECTION = ($stateParams.sortorder) ? $stateParams.sortorder : 'desc';

    // Paging
    vm.dataPager = new DataPager();
    vm.dataPager.pageSize = 20;
    vm.dataPager.loadPage = loadPage;
    vm.dataPager.sortBy = DEFAULT_SORT_CRITERIA;
    vm.dataPager.sortDirection = DEFAULT_SORT_DIRECTION;

    // Operation methods
    vm.refresh = refresh;
    vm.canSort = function() { return vm.dataPager.items.length > 1; };

    activate();
    return;

    // ------------------------------------------------------------------- Interface operations

    function activate() {
        _setScrollableContainerForInfiniteScroll

        /*
        if (tutorialService.isActive()) {
            // Configure tutorials
            configureTutorial();
            tutorialService.current(vm.title);
        }*/

        // Load view
        refresh();
    }

    function refresh() {
        vm.dataPager.reset();
        vm.dataPager
            .getNextPage()
            .then(function() {
                // Expand if only 1 item
                if (vm.dataPager.items.length === 1) {
                    vm.dataPager.items[0].isExpanded = true;
                }
            });
    }

    // --------------------------------------------------------------------------- Data loading

    function loadPage(pageIndex, pageSize, sortBy, sortDirection) {
        var offset = pageIndex * pageSize;

        loadCount();
        return dataserviceInvoice
            .getInvoiceList(vm.vnb, vm.guarantorId, offset, pageSize, sortBy, sortDirection)
            .then(function(result) {
                // Convert items to viewmodel objects
                var items = _.isArray(result) ? result : [];
                return items.map(function(item) {
                    return {
                        invoice: item,
                        isExpanded: false,
                    };
                });
            });
    }

    function loadCount() {
        return dataserviceInvoice
            .getInvoiceCount(vm.vnb, vm.guarantorId)
            .then(function(count) {
                vm.dataPager.setTotalItemsCount(count);
            });
    }

    // ------------------------------------------------------------------------------- Tutorial

    function configureTutorial() {
        var contextBoxSteps = ContextBox.getTutorialSteps();
        var steps = [{
            element: 'fec-data-pager-sort',
            introKey: 'core.GUIDE_ORDER_SORT',
            position: 'bottom-middle-aligned',
            isValid: function() {
                return vm.canSort();
            }
        }, {
            element: '.expander',
            introKey: 'invoice.GUIDE_GUARANTORS_INVOICES',
            position: 'bottom-middle-aligned'
        }];

        tutorialService.setSteps(vm.title, 0, contextBoxSteps.concat(steps));
    }

    // ------------------------------------------------------------------------------- helper functions

    function _setScrollableContainerForInfiniteScroll() {
        // Scrollable container (relevant for infinite-scroll)
        vm.scrollableContainer = layoutService.getScrollableContainer();
    }
}


export default InvoicesController;
