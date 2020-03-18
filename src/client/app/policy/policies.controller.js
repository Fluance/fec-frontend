// jscs:disable requireParenthesesAroundIIFE

import _ from 'lodash';

PoliciesController.$inject = [
    '$scope',
    '$stateParams',
    //LayoutPatientContextBox',
    'dataPager',
    'dataservice.visits',
    //'tutorialService',
];

/* @ngInject */
function PoliciesController($scope, $stateParams, DataPager, dataServiceVisits) {

    /*jshint validthis: true */
    var vm = this;
    vm.title = 'PoliciesController';
    vm.vnb = $stateParams.vnb;

    // Sort options
    vm.sortCriteria = [
        { key: 'priority', name: 'policy.GUA_PRIORITY' }
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
    //$scope.$on('patient-policy.stateChanged', onPolicyStateChanged);

    activate();

    // ------------------------------------------------------------------- Interface operations

    function activate() {
        /*
        if (tutorialService.isActive()) {
            // Configure tutorials
            configureTutorial();
            configureTutorialPolicyExpanded();
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
            offset: pageIndex * pageSize,
            limit: pageSize,
            orderby: sortBy,
            sortorder: sortDirection
        };

        return dataServiceVisits
            .getPolicyList(params)
            .then(function(result) {
                // Initialize total record count
                vm.dataPager.setTotalItemsCount(result.totalRecords);

                // Convert items to viewmodel objects
                var items = _.isArray(result.policies) ? result.policies : [];
                return items.map(function(item) {
                    return {
                        vnb: vm.vnb,
                        policy: item,
                        isExpanded: false
                    };
                });
            });
    }

    // ------------------------------------------------------------------------------- Tutorial

    function configureTutorial() {
        var contextBoxSteps = ContextBox.getTutorialSteps();
        var steps = [{
            element: '.expander',
            introKey: 'policy.GUIDE_POLICIES_AREA',
            position: 'bottom-middle-aligned'
        }];

        tutorialService.setSteps(vm.title, 0, contextBoxSteps.concat(steps));
    }

    function configureTutorialPolicyExpanded() {
        tutorialService.setSteps(tutorialService.CHAPTER_NAME_POLICY, 0, [{
            element: '.expander.expanded #policy-details',
            introKey: 'policy.GUIDE_POLICY_EXPANDED',
            position: 'top-middle-aligned'
        }]);
    }

    function onPolicyStateChanged(event, args) {
        // Set tutorial chapter
        var chapter = (_.some(vm.dataPager.items, function(r) {
            return r.isExpanded;
        })) ? tutorialService.CHAPTER_NAME_POLICY : vm.title; // jshint ignore:line
        tutorialService.current(chapter);
    }
}

export default PoliciesController;
