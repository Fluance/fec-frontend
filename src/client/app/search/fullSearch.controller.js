fullSearchController.$inject = ['$filter', '$stateParams', 'fullSearchService', 'logger', 'searchQuery'];

function fullSearchController($filter, $stateParams, fullSearchService, logger, SearchQuery) {
    var fnTranslate = $filter('translate');

    /*jshint validthis: true */
    var ctrl = this;
    ctrl.counts = {
        total: 0,
        patient: 0,
        visit: 0
    };

    ctrl.noResultsFound = false;
    ctrl.isLoading = false;

    // Querying
    ctrl.searchText = $stateParams.field;
    ctrl.searchQuery = new SearchQuery($stateParams);

    ctrl.getCriteriaValue = getCriteriaValue;

    activate();
    return ctrl;

    // ------------------------------------------------------------------- Interface operations

    function activate() {
        ctrl.isLoading = true;
        ctrl.noResultsFound = false;
        fullSearchService.search(ctrl.searchText)
            .then(function(results) {
                // Update counts
                ctrl.counts.total = results.totalCount || 0;
                ctrl.counts.patient = (results.patient) ? results.patient.count : 0;
                ctrl.counts.visit = (results.visit) ? results.visit.count : 0;

                ctrl.results = results;
            })
            .catch(function(exception) {
                var message = fnTranslate('error.ERROR');
                logger.error(message, exception);
            })
            .finally(function() {
                ctrl.noResultsFound = (ctrl.counts.total === 0);
                ctrl.isLoading = false;
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
}

export default fullSearchController;
