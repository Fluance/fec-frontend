import template from './sidenav.search.criteria.component.html';

const SidenavSearchCriteria = {
    controller: controller,
    controllerAs: 'vm',
    require: {
        sidenavSearch: '^fecSidenavSearch'
    },
    templateUrl: template
};

controller.$inject = ['$scope', '$filter', '$stateParams', 'logger', 'datePicker',
    'searchQueryService', 'searchQuery', 'searchQueryService',
];

/* @ngInject */
function controller($scope, $filter, $stateParams, logger, datePicker,
                    searchQueryService, SearchQuery, SearchQueryService) {

    var fnTranslate = $filter('translate');

    /*jshint validthis: true */
    var vm = this;
    vm.title = 'fecSidenavSearchCriteria';

    vm.admissionstatusSelection = [{
        key: '',
        displayName: 'core.ADMISSIONSTATUS_ALL'
    }, {
        key: 'preadmission',
        displayName: 'core.ADMISSIONSTATUS_PREADMITTED'
    }, {
        key: 'currentadmission',
        displayName: 'core.ADMISSIONSTATUS_PRESENT'
    }];
    vm.maxBirthdate = moment().toDate();

    vm.params = undefined;

    vm.$onInit = onInit;

    // ------------------------------------------------------------------------- Initialization

    function onInit() {
        // Initialize parent component
        vm.sidenavSearch.initializeForm = _initializeForm;
        vm.sidenavSearch.submit = _submit;
        //vm.sidenavSearch.tutorialChapterName = tutorialService.CHAPTER_NAME_SIDEBAR_SEARCH_CRITERIA;
        vm.sidenavSearch.isValid = _isValid;

        _initializeForm();

        /*
        if (tutorialService.isActive()) {
            // Configure tutorials
            configureTutorial();
        }*/
    }

    function _initializeForm() {
        // Reset params
        vm.params = {
            birthdate: null,
            name: undefined,
            firstname: undefined,
            maidenname: false,
            admissionstatus: ''
        };

        // Restore params from $stateParams
        _restoreParams();
    }

    function _restoreParams() {
        var searchQuery = new SearchQuery(_.pickBy($stateParams, _.keys(vm.params)));
        _.extend(vm.params, _.reduce(
            searchQuery.getCriteria(),
            function(memo, aCriterion) {
                memo[aCriterion.key] = aCriterion.getValue();
                return memo;
            }, {}));
    }

    // -------------------------------------------------------------------------- Form handling

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
                throw fnTranslate('search.ERROR_NO_PERSONAL_DATA') + fnTranslate('.');
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
            .setSteps(tutorialService.CHAPTER_NAME_SIDEBAR_SEARCH_CRITERIA, 0, [{
                element: '[tutorial-step="lastname"]',
                introKey: 'layout.SEARCH_NAME',
                position: 'bottom'
            }, {
                element: '[tutorial-step="firstname"]',
                introKey: 'layout.SEARCH_FIRSTNAME',
                position: 'right-bottom'
            }, {
                element: '[tutorial-step="maidenname"]',
                introKey: 'layout.SEARCH_MAIDEN_NAME',
                position: 'bottom'
            }, {
                element: '[tutorial-step="birthdate"]',
                introKey: 'layout.SEARCH_DATE_BIRTH',
                position: 'bottom'
            }, {
                element: '[tutorial-step="admissionstatus"]',
                introKey: 'layout.SEARCH_FILTER',
                position: 'bottom'
            }]);
    }
}

export default SidenavSearchCriteria;
