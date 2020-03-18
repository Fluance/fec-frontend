import template from './sidenav.search.ids.component.html';

const SidenavSearchIds = {
    controller: controller,
    controllerAs: 'vm',
    require: {
        sidenavSearch: '^fecSidenavSearch'
    },
    templateUrl: template
};

controller.$inject = ['$scope', '$filter', '$stateParams', 'logger', 'searchQuery', 'searchQueryService'];

/* @ngInject */
function controller($scope, $filter, $stateParams, logger, SearchQuery, SearchQueryService) {

    var fnTranslate = $filter('translate');

    /*jshint validthis: true */
    var vm = this;
    vm.title = 'fecSidenavSearchIds';
    vm.params = undefined;

    // Functions for the UI sorted by name
    vm.clearInputField = clearInputField;

    vm.$onInit = onInit;

    // ------------------------------------------------------------------------- Initialization

    function onInit() {
        // Initialize parent component
        vm.sidenavSearch.initializeForm = _initializeForm;
        vm.sidenavSearch.submit = _submit;
        //vm.sidenavSearch.tutorialChapterName = tutorialService.CHAPTER_NAME_SIDEBAR_SEARCH_PATIENT_ID;
        vm.sidenavSearch.isValid = _isValid;

        _initializeForm();

        /*
        if (tutorialService.isActive()) {
            // Configure tutorials
            configureTutorial();
        }
        */
    }

    function _initializeForm() {
        // Reset params
        vm.params = {
            pid: undefined,
            vnb: undefined
        };

        // Restore params from $stateParams
        _restoreParams();
    }

    function _restoreParams() {
        var searchQuery = new SearchQuery(_.pickBy($stateParams, _.keys(vm.params)));
        vm.params = _.reduce(
            searchQuery.getCriteria(),
            function(memo, aCriterion) {
                memo[aCriterion.key] = aCriterion.getValue();
                return memo;
            }, {});
    }

    // -------------------------------------------------------------------------- Form handling

    function clearInputField(inputFieldName) {
        if (inputFieldName === 'pid') {
            vm.params.pid = null;
        } else if (inputFieldName === 'vnb') {
            vm.params.vnb = null;
        }
    }

    function _submit() {
        var searchQuery = new SearchQuery(vm.params);

        try {
            if (searchQuery.isValid()) {
                SearchQueryService
                    .addEntryToHistory(searchQuery)
                    .then(function() {
                        SearchQueryService.performNavigation(searchQuery);
                    });
            } else {
                throw fnTranslate('search.ERROR_NO_ID') + fnTranslate('.');
            }
        } catch (errorMessage) {
            logger.info(errorMessage);
        }
    }

    function _isValid() {
        if ($scope.searchForm && $scope.searchForm.$valid) {
            return true;
        } else {
            return false;
        }
    }

    // ------------------------------------------------------------------------------- Tutorial

    function configureTutorial() {
        tutorialService
            .setSteps(tutorialService.CHAPTER_NAME_SIDEBAR_SEARCH_PATIENT_ID, 0, [{
                element: '[tutorial-step="pid"]',
                introKey: 'layout.SEARCH_PATIENT_ID',
                position: 'bottom'
            }, {
                element: '[tutorial-step="vnb"]',
                introKey: 'layout.SEARCH_VISIT_NUMBER',
                position: 'bottom'
            }]);
    }
}

export default SidenavSearchIds;
