import _ from 'lodash';
import template from './serviceFees.component.html';

const Servicefees = {
    templateUrl: template,
    controller: controller,
    bindings: {
        vnb: '<'
    }
};

controller.$inject = [
    '$stateParams',
    '$q',
    'sessionService',
    'dataservice.servicefees',
    'dataPager',
    'layoutService'
];

function controller($stateParams, $q, session, dataserviceServiceFees, DataPager, layoutService) {
    /*jshint validthis: true */
    var ctrl = this;
    ctrl.title = 'ServiceFeeListController';

    // Sort options
    ctrl.groupCriteria = dataserviceServiceFees.groupCriteria;
    var DEFAULT_GROUP_CRITERIA = (ctrl.groupCriteria.length > 0) ? ctrl.groupCriteria[0].key : undefined;
    var DEFAULT_SORT_DIRECTION = ($stateParams.sortorder) ? $stateParams.sortorder : 'desc';

    // Paging
    ctrl.dataPager = new DataPager();
    ctrl.dataPager.pageSize = 15;
    ctrl.dataPager.loadPage = loadPage;
    ctrl.dataPager.sortBy = DEFAULT_GROUP_CRITERIA;
    ctrl.dataPager.sortDirection = DEFAULT_SORT_DIRECTION;
    ctrl.dataPager.isLoading = true;

    ctrl.totalFees = 0;

    // Operation methods
    ctrl.refresh = refresh;
    ctrl.canSort = function() { return ctrl.dataPager.items.length > 1; };

    ctrl.sortDirections = [
        { key: 'asc', name: 'core.SORT_ASC', icon: 'sortAscending' },
        { key: 'desc', name: 'core.SORT_DESC', icon: 'sortDescending' }
    ];

    ctrl.$onInit = onInit;

    ctrl.toggleSortDirection = toggleSortDirection;
    ctrl.refresh = refresh;

    // ------------------------------------------------------------------- Interface operations

    function onInit() {
        var ctrl = this;
        ctrl.vnb = $stateParams.vnb;

        _setScrollableContainerForInfiniteScroll();

        // Load view
        refresh();
    }

    function toggleSortDirection () {
        if (ctrl.dataPager.sortDirection === 'asc') {
            ctrl.dataPager.sortDirection = 'desc';
        } else if (ctrl.dataPager.sortDirection === 'desc') {
            ctrl.dataPager.sortDirection = 'asc';
        }

        // Load view
        refresh();
    }

    function refresh() {
        ctrl.dataPager.isLoading = true;
        ctrl.dataPager.reset();

        var promises = [];

        var paramsFeeCount = {
            visitnb: ctrl.vnb,
            orderby: 'benefitdt',
            sortorder: ctrl.sortDirection,
            filterby: ctrl.filterBy,
            filtervalue: ctrl.filterValue
        };

        var paramsFeeGroupCount = {
            visitnb: $stateParams.vnb,
            filterby: ctrl.dataPager.sortBy,
            sortorder: ctrl.dataPager.sortDirection
        };

        $q.all([dataserviceServiceFees.getServiceFeeCount(paramsFeeCount),
            dataserviceServiceFees.getServiceFeeGroupCount(paramsFeeGroupCount)])
            .then(function(results) {
                //Total Fees
                ctrl.totalFees = results[0];

                //Total of groups for the infinite scroll component
                ctrl.dataPager.setTotalItemsCount(results[1]);

                if(ctrl.totalFees > 0) {
                    ctrl.dataPager
                        .getNextPage()
                        .finally(function () {
                            ctrl.dataPager.isLoading = false;
                        });
                } else {
                    ctrl.dataPager.isLoading = false;
                }
            })
            .catch(function() {
                ctrl.totalFees = 0;
                ctrl.dataPager.setTotalItemsCount(0);
                ctrl.dataPager.isLoading = false;
            });
    }

    // --------------------------------------------------------------------------- Data loading
    function loadPage(pageIndex, pageSize, sortBy, sortDirection) {
        var params = {
            visitnb: $stateParams.vnb,
            filterby: sortBy,
            sortorder: sortDirection,
            offset: pageIndex * pageSize,
            limit: pageSize
        };

        return dataserviceServiceFees
            .getServiceFeeGroupList(params)
            .then(function(result) {
                // Convert items to viewmodel objects
                var items = _.isArray(result) ? result : [];

                return items;
            });
    }


    // ------------------------------------------------------------------------------- helper functions
    function _setScrollableContainerForInfiniteScroll() {
        // Scrollable container (relevant for infinite-scroll)
        ctrl.scrollableContainer = layoutService.getScrollableContainer();
    }
}

export default Servicefees;
