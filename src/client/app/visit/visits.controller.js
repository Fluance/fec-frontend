// jscs:disable requireParenthesesAroundIIFE

VisitsController.$inject = [
    '$scope',
    '$stateParams',
    //'LayoutPatientContextBox',
    'dataPager',
    'dataservice.visits',
    //'tutorialService',
    'layoutService'
];

/* @ngInject */
function VisitsController($scope, $stateParams, DataPager, dataServiceVisits, layoutService) {

    /*jshint validthis: true */
    var vm = this;
    vm.title = 'VisitsController';

    // Sort options
    vm.sortCriteria = dataServiceVisits.sortCriteria;
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
    //$scope.$on('visit.stateChanged', onVisitStateChanged);

    activate();
    return vm;

    // ------------------------------------------------------------------- Interface operations

    function activate() {
        _setScrollableContainerForInfiniteScroll();

        /*
        if (tutorialService.isActive()) {
            // Configure tutorials
            configureTutorial();
            configureTutorialVisit();
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
            })
            .catch(function(error) {
                console.error(error);
            })
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

        return dataServiceVisits
            .getPatientVisits(params)
            .then(function(result) {
                // Initialize total record count
                vm.dataPager.setTotalItemsCount(result.totalRecords);

                // Convert items to viewmodel objects
                var items = _.isArray(result.visits) ? result.visits : [];
                return items.map(function(item) {
                    return {
                        company: item.company,
                        visit: item.visit,
                        isExpanded: false,
                        isLoadingDetails: false,
                        isLoadingPhysicians: false,
                        details: null,
                        physicians: null
                    };
                });
            })
            .catch(function(error) {
                console.error(error);
            })
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
        }, {
            element: '.expander',
            introKey: 'visit.GUIDE_VISIT_AREA',
            position: 'bottom-middle-aligned'
        }];

        //tutorialService.setSteps(vm.title, 0, contextBoxSteps.concat(steps));
    }

    function configureTutorialVisit() {
        tutorialService
            .setSteps(tutorialService.CHAPTER_NAME_VISIT, 0, [{
                element: '.expander.expanded fec-nav-button-notes',
                introKey: 'patient.GUIDE_NOTE',
                position: 'top-middle-aligned'
            }, {
                element: '.expander.expanded fec-nav-button-icd-chop-list',
                introKey: 'visit.GUIDE_ICD_CHOP',
                position: 'top-middle-aligned'
            }, {
                element: '.expander.expanded fec-nav-button-guarantor-list',
                introKey: 'visit.GUIDE_GUARANTORS',
                position: 'top-middle-aligned'
            }, {
                element: '.expander.expanded fec-nav-button-policy-list',
                introKey: 'visit.GUIDE_POLICIES',
                position: 'top-middle-aligned'
            }, {
                element: '.expander.expanded fec-nav-button-reporting',
                introKey: 'core.GUIDE_REPORTING',
                position: 'top-middle-aligned'
            }, {
                element: '.expander.expanded fec-nav-button-benefit-list',
                introKey: 'visit.GUIDE_BENEFITS',
                position: 'top-middle-aligned'
            }, {
                element: '.expander.expanded fec-nav-button-medlab',
                introKey: 'visit.GUIDE_PRESCRIPTION',
                position: 'top-middle-aligned'
            }]);
    }

    function onVisitStateChanged(event, args) {
        // Set tutorial chapter
        var chapter = (_.some(vm.dataPager.items, function(r) {
            return r.isExpanded;
        })) ? tutorialService.CHAPTER_NAME_VISIT : vm.title; // jshint ignore:line
        tutorialService.current(chapter);
    }

    // ------------------------------------------------------------------------------- helper functions

    function _setScrollableContainerForInfiniteScroll() {
        // Scrollable container (relevant for infinite-scroll)
        vm.scrollableContainer = layoutService.getScrollableContainer();
    }
}

export default VisitsController;
