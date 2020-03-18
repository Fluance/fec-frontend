import _ from 'lodash';

AccessLogController.$inject = ['$stateParams', '$translate', 'dataPager', 'dataservice.accessLogs', 'dataservice.patients', 'logger', 'layoutService'];

function AccessLogController($stateParams, $translate, DataPager, dataserviceAccessLogs, patientService, logger, layoutService) {

    /*jshint validthis: true */
    var vm = this;
    vm.title = 'AccessLogController';
    vm.currentPatient = undefined;

    // Sort options
    vm.sortCriteria = dataserviceAccessLogs.sortCriteria;
    var DEFAULT_SORT_CRITERIA = ($stateParams.orderby) ? $stateParams.orderby : (vm.sortCriteria.length > 0) ? vm.sortCriteria[0].key : undefined;
    var DEFAULT_SORT_DIRECTION = ($stateParams.sortorder) ? $stateParams.sortorder : 'desc';

    // Paging
    vm.dataPager = new DataPager();
    vm.dataPager.pageSize = 40;
    vm.dataPager.loadPage = loadPage;
    vm.dataPager.sortBy = DEFAULT_SORT_CRITERIA;
    vm.dataPager.sortDirection = DEFAULT_SORT_DIRECTION;

    // Operation methods
    vm.refresh = refresh;
    vm.canSort = function() { return vm.dataPager.items.length > 1; };
    vm.closeOther = closeOther;

    activate();

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
        loadPatient();
        refresh();
    }

    function refresh() {
        vm.dataPager.reset();
        vm.dataPager.getNextPage();
    }

    // --------------------------------------------------------------------------- Data loading

    function loadPatient() {
        return patientService
            .getPatientDetail($stateParams.pid)
            .then(function(patient) {
                vm.currentPatient = {
                    pid: $stateParams.pid,
                    firstName: patient.patientInfo.firstName,
                    lastName: patient.patientInfo.lastName
                };
            });
    }

    function loadPage(pageIndex, pageSize, sortBy, sortDirection) {
        var params = {
            pid: $stateParams.pid,
            offset: pageIndex * pageSize,
            limit: pageSize,
            orderby: sortBy,
            sortorder: sortDirection
        };

        loadTotalCount();
        return dataserviceAccessLogs.getAccessLogs(params);
    }

    function loadTotalCount() {
        return dataserviceAccessLogs.getAccessLogsCount($stateParams.pid)
            .then(function(count) {
                vm.dataPager.setTotalItemsCount(count);
            })
            .catch(function() {
                vm.dataPager.setTotalItemsCount(0);
            });
    }

    function closeOther() {
        _.forEach(vm.dataPager.items, function (item) {
            if (item.isExpanded) {
                item.isExpanded = false;
            }
        });
    }

    // ------------------------------------------------------------------------------- Tutorial

    /**
     * Defines the steps the tutorial of the access logs page.
     */
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
            element: '#accessLogsContainer .collection-item',
            introKey: 'accessLog.GUIDE_LOG_MESSAGES',
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

export default AccessLogController;
