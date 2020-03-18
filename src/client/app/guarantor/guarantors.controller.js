// jscs:disable requireParenthesesAroundIIFE
(function() {
    'use strict';

    angular
        .module('app.guarantor')
        .controller('GuarantorsController', GuarantorsController);

    GuarantorsController.$inject = [
        '$scope',
        '$stateParams',
        //'LayoutPatientContextBox',
        'dataPager',
        'dataservice.visits',
        //'tutorialService',
        'layoutService'
    ];

    function GuarantorsController($scope, $stateParams, DataPager, dataserviceVisits, layoutService) {

        /*jshint validthis: true */
        var vm = this;
        vm.title = 'GuarantorsController';
        vm.vnb = $stateParams.vnb;

        // Sort options
        vm.sortCriteria = [
            { key: 'name', name: 'core.NAME' }
        ];
        var DEFAULT_SORT_CRITERIA = ($stateParams.orderby) ? $stateParams.orderby : (vm.sortCriteria.length > 0) ? vm.sortCriteria[0].key : undefined;
        var DEFAULT_SORT_DIRECTION = ($stateParams.sortorder) ? $stateParams.sortorder : 'asc';

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
        //$scope.$on('fluance-guarantor.stateChanged', onGuarantorStateChanged);

        activate();
        return;

        // ------------------------------------------------------------------- Interface operations

        function activate() {
            _setScrollableContainerForInfiniteScroll();

            /*
            if (tutorialService.isActive()) {
                // Configure tutorials
                configureTutorial();
                configureTutorialGuarantor();
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
                vnb: vm.vnb,
                offset: 0,
                orderBy: sortBy,
                sortorder: sortDirection,
                limit: vm.pageSize
            };

            return dataserviceVisits
                .getGuarantorList(params)
                .then(function(result) {
                    // Initialize total record count
                    vm.dataPager.setTotalItemsCount(result.guarantors.length + 1); // +1 for patient is his own guarantor;

                    // Convert items to viewmodel objects
                    var items = _.isArray(result.guarantors) ? result.guarantors : [];
                    items.map(function(item) {
                        item.vnb = vm.vnb;
                        item.guarantor = item;
                        item.isExpanded = false;
                    });
                    return items;
                });
        }

        // ------------------------------------------------------------------------------- Tutorial

        function configureTutorial() {
            var contextBoxSteps = ContextBox.getTutorialSteps();
            var steps = [{
                element: '.expander',
                introKey: 'guarantor.GUIDE_GUARANTOR_RESULT',
                position: 'bottom-middle-aligned'
            }];

            tutorialService.setSteps(vm.title, 0, contextBoxSteps.concat(steps));
        }

        function configureTutorialGuarantor() {
            tutorialService.setSteps(tutorialService.CHAPTER_NAME_GUARANTOR, 0, [{
                element: '.expander.expanded fec-nav-button-invoice-list',
                introKey: 'guarantor.GUIDE_GUARANTORS_INVOICES',
                position: 'top-middle-aligned'
            }]);
        }

        function onGuarantorStateChanged(event, args) {
            // Set tutorial chapter
            var chapter = (_.some(vm.dataPager.items, function(r) {
                return r.isExpanded;
            })) ? tutorialService.CHAPTER_NAME_GUARANTOR : vm.title; // jshint ignore:line
            tutorialService.current(chapter);
        }

        // ------------------------------------------------------------------------------- helper functions

        function _setScrollableContainerForInfiniteScroll() {
            // Scrollable container (relevant for infinite-scroll)
            vm.scrollableContainer = layoutService.getScrollableContainer();
        }
    }
})();
