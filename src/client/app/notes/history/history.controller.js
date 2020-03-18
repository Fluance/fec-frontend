// jscs:disable requireParenthesesAroundIIFE
import _ from 'lodash';

HistoryController.$inject = [
    '$scope',
    '$stateParams',
    //'LayoutPatientContextBox',
    'dataPager',
    'dataservice.history',
    //'tutorialService',
    'layoutService'
];

/* @ngInject */
function HistoryController($scope, $stateParams, DataPager, dataServiceHistory, layoutService) {

    /*jshint validthis: true */
    var vm = this;
    vm.title = 'HistoryController';
    vm.noteId = $stateParams.noteId;

    // Paging
    vm.dataPager = new DataPager();
    vm.dataPager.pageSize = 10;
    vm.dataPager.loadPage = loadPage;

    // Operation methods
    vm.refresh = refresh;

    activate();
    return vm;

    // ------------------------------------------------------------------- Interface operations

    function activate() {
        _setScrollableContainerForInfiniteScroll();

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
        var params = {
            noteId: vm.noteId,
            offset: pageIndex * pageSize,
            limit: pageSize,
            orderby: sortBy,
            sortorder: sortDirection
        };

        return dataServiceHistory
            .getHistoryList(params)
            .then(function(result) {
                return dataServiceHistory.countHistoryItems(vm.noteId).then(function(data) {
                    vm.dataPager.setTotalItemsCount(data.count);
                }).then(function() {
                    return _.isArray(result) ? result : [];
                });
            });
    }

    // ------------------------------------------------------------------------------- Tutorial

    function configureTutorial() {
        var contextBoxSteps = ContextBox.getTutorialSteps();
        var steps = [{
            element: '.expander',
            introKey: 'notes.GUIDE_HISTORY_ITEM',
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

export default HistoryController;
