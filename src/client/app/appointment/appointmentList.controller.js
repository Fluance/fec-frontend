import _ from 'lodash';

AppointmentListController.$inject = [
    '$scope',
    '$state',
    '$stateParams',
    '$translate',
    'dataservice.appointments',
    'logger',
    'searchStateManager',
    //'tutorialService',
    'layoutService',
    //'LayoutPatientContextBox',
    '$filter',
    'dataPager'
];

/* @ngInject */
function AppointmentListController($scope, $state, $stateParams, $translate, dataserviceAppointments, logger,
    searchStateManager, layoutService, $filter, DataPager) {

    /*jshint validthis: true */
    var vm = this;
    vm.title = 'AppointmentsController';

    // Sort options
    vm.sortCriteria = dataserviceAppointments.sortCriteria;
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

    // Events
    //$scope.$on('appointments.stateChanged', onAppointmentsStateChanged);

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
            pid: $stateParams.pid,
            offset: pageIndex * pageSize,
            limit: pageSize,
            orderby: sortBy,
            sortorder: sortDirection
        };

        return dataserviceAppointments
            .getAppointmentListForPatient(params)
            .then(function(result) {
                // Initialize total record count
                var totalCount = (_.isArray(result) && result.length > 0) ? result[0].nbRecords : 0;
                vm.dataPager.setTotalItemsCount(totalCount);

                // Convert items to viewmodel objects
                var items = _.isArray(result) ? result : [];
                return items.map(function(item) {
                    return {
                        appointment: item,
                        isExpanded: false,
                        isLoadingDetails: false
                    };
                });
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
                    return (vm.dataPager.items.length > 1);
                }
            },
            // {
            //     element: '.expander.expanded appointment-detail',
            //     introKey: 'appointment.GUIDE_APPOINTMENT_AREA_EXPANDED',
            //     position: 'bottom-middle-aligned'
            // },
            {
                element: '.expander',
                introKey: 'appointment.GUIDE_APPOINTMENT_AREA',
                position: 'bottom-middle-aligned'
            }
        ];

        tutorialService.setSteps(vm.title, 0, contextBoxSteps.concat(steps));
    }

    function onAppointmentsStateChanged(event, args) {
        // Set tutorial chapter
        var chapter = (_.some(vm.dataPager.items, function(r) {
            return r.isExpanded;
        })) ? tutorialService.CHAPTER_NAME_APPOINTMENT : vm.title; // jshint ignore:line
        tutorialService.current(chapter);
    }

    // ------------------------------------------------------------------------------- helper functions

    function _setScrollableContainerForInfiniteScroll() {
        // Scrollable container (relevant for infinite-scroll)
        vm.scrollableContainer = layoutService.getScrollableContainer();
    }
}

export default AppointmentListController;
