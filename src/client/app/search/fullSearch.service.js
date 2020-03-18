fullSearchService.$inject = ['$mdMedia', '$q', 'dataservice.fullSearch', 'sessionService'];

function fullSearchService($mdMedia, $q, dataserviceFullSearch, session) {

    var DEFAULT_RESULT_COUNT = 3;

    var service = {
        // Constants
        TYPE_PATIENT: 'patient',
        TYPE_VISIT: 'visit',

        // Methods
        getTutorialStepFullSearchInput: getTutorialStepFullSearchInput,
        search: search,
        searchByEntityType: searchByEntityType
    };

    return service;

    // ------------------------------------------------------------------------ Search handling

    function search(searchText, offset, limit) {
        limit = limit || DEFAULT_RESULT_COUNT;
        offset = offset || 0;

        return dataserviceFullSearch.search(searchText, undefined, offset, limit)
            .then(function(results) {
                var data = {
                    totalCount: results.totalCount
                };

                // Map as dictionary for easy access by entity-type
                if (_.isArray(results.groups)) {
                    results.groups.map(function(group) {
                        if (group.count > 0) { data[group.entityType] = group; }
                    });
                }

                return data;
            });
    }

    function searchByEntityType(searchText, entityType, offset, limit) {
        return dataserviceFullSearch.search(searchText, entityType, offset, limit)
            .then(function(result) {
                return (result.groups && result.groups.length > 0) ? result.groups[0] : undefined;
            });
    }

    // ----------------------------------------------------------------------- Tutorial support

    function getTutorialStepFullSearchInput() {
        return [
            {
                element: '[tutorial-step="full-search-input"]',
                introKey: 'search.GUIDE_FULL_SEARCH_INPUT',
                position: 'bottom-middle-aligned',
                isValid: function() { return session.isAuthenticated && $mdMedia('gt-xs'); }
            },
            {
                element: '[tutorial-step="full-search-input-xs"]',
                introKey: 'search.GUIDE_FULL_SEARCH_INPUT',
                position: 'bottom-middle-aligned',
                isValid: function() { return session.isAuthenticated && $mdMedia('xs'); }
            }
        ];
    }
}

export default fullSearchService;
