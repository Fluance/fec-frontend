fullSearchEntityTypeController.$inject = ['$filter', '$scope', '$stateParams', 'dataPager', 'fullSearchService', 'layoutService', 'logger', 'searchQuery'];

function fullSearchEntityTypeController($filter, $scope, $stateParams, DataPager, fullSearchService, layoutService, logger, SearchQuery) {
    var fnTranslate = $filter('translate');

    /*jshint validthis: true */
    var ctrl = this;

    ctrl.scrollableContainer = layoutService.getScrollableContainer();

    // Parameters
    ctrl.entityType = $stateParams.type;
    ctrl.searchText = $stateParams.field;
    ctrl.searchQuery = new SearchQuery($stateParams);

    // Paging
    ctrl.dataPager = new DataPager();
    ctrl.dataPager.pageSize = 10;
    ctrl.dataPager.loadPage = loadPage;

    // Operation methods
    ctrl.getTitle = getTitle;
    ctrl.getCriteriaValue = getCriteriaValue;
    ctrl.refresh = refresh;

    activate();
    return ctrl;

    // ------------------------------------------------------------------- Interface operations

    function activate() {
        // Load view
        refresh();
    }

    function refresh() {
        ctrl.dataPager.reset();
        ctrl.dataPager
            .getNextPage()
            .then(function() {
                // Expand if only 1 item
                if (ctrl.dataPager.items.length === 1) {
                    ctrl.dataPager.items[0].isExpanded = true;
                }
            });
    }

    function getCriteriaValue() {
        var criteriaParam = '';
        if (ctrl.searchQuery && ctrl.searchQuery.__criteria && ctrl.searchQuery.__criteria) {
            _.each(ctrl.searchQuery.__criteria, function (criteria) {
                if (criteria.key === 'field') {
                    criteriaParam = criteria.value;
                }
            });
        }
        return criteriaParam;
    }

    function getTitle() {
        switch (ctrl.entityType) {
            case fullSearchService.TYPE_PATIENT:
                return 'search.TITLE_PATIENTS';

            case fullSearchService.TYPE_VISIT:
                return 'search.TITLE_VISITS';

            default:
                return 'search.TITLE';
        }
    }

    // --------------------------------------------------------------------------- Data loading

    function loadPage(pageIndex, pageSize, sortBy, sortDirection) {
        var offset = pageIndex * pageSize;

        return fullSearchService.searchByEntityType(ctrl.searchText, ctrl.entityType, offset, pageSize)
            .then(function(result) {
                // Initialize total record count
                ctrl.dataPager.setTotalItemsCount(result.count);

                // Convert items to viewmodel objects
                var items = _.isArray(result.data) ? result.data : [];
                return items;
            })
            .catch(function(exception) {
                var message = fnTranslate('error.ERROR');
                logger.error(message, exception);
            });
    }
}

export default fullSearchEntityTypeController;
