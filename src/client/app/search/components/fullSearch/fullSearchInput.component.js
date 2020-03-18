import template from './fullSearchInput.component.html';

const FullSearchInput = {
    controller: ['searchQuery', 'searchQueryService', 'logger', '$filter', controller],
    controllerAs: 'vm',
    templateUrl: template
};

function controller(SearchQuery, SearchQueryService, logger, $filter) {
    var fnTranslate = $filter('translate');

    /*jshint validthis: true */
    var vm = this;

    // Properties
    vm.text = '';

    // Methods
    vm.onKeyUp = onKeyUp;
    vm.submit = submit;

    // --------------------------------------------------------------- Interface implementation

    function onKeyUp(event) {
        if (event.keyCode === 13) { this.submit(); }
    }

    function submit() {
        var searchQuery = new SearchQuery({ field: this.text });

        try {
            if (searchQuery.isValid()) {
                SearchQueryService
                    .addEntryToHistory(searchQuery)
                    .then(function () {
                        SearchQueryService.performNavigation(searchQuery);
                    });
            } else {
                throw fnTranslate('search.ERROR_NO_CRITERIA') + fnTranslate('.');
            }
        } catch (errorMessage) {
            logger.info(errorMessage);
        }
    }
}

export default FullSearchInput;
