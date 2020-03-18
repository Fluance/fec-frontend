

searchQueryService.$inject = [
    '$injector', '$q', '$rootScope', '$state', '$translate', 'Event', 'logger',
    'searchCriterion', 'searchQuery', 'sessionService', 'userService'
];

function searchQueryService($injector, $q, $rootScope, $state, $translate, Event, logger, SearchCriterion, SearchQuery, session, userService) {

    var ROUTING_STATE_NAME_SEARCH_RESULT = 'searchpatient';
    var ROUTING_STATE_NAME_PATIENT = 'patient';
    var ROUTING_STATE_NAME_VISIT = 'visit';
    var ROUTING_STATE_NAME_FULLSEARCH_ALL = 'fullSearch';
    var ROUTING_STATE_NAME_FULLSEARCH_ENTITY = 'fullSearchByType';

    var SEARCH_HISTORY_ENTRIES_MAX = 5;

    var service = {

        // Public functions
        getLastSearches: getLastSearches,
        getFavoriteSearches: getFavoriteSearches,
        addEntryToHistory: addEntryToHistory,
        addEntryToFavorites: addEntryToFavorites,
        executeQuery: executeQuery, // To be done...
        removeEntryFromHistory: removeEntryFromHistory,
        removeEntryFromFavorites: removeEntryFromFavorites,
        clearHistory: clearHistory,
        performNavigation: performNavigation,
        //getInvalidCharacters: getInvalidCharacters,

        //Events
        onHistoryChanged: new Event()
    };

    onInit();
    return service;

    // ------------------------------------------------------------------------- Initialization

    function onInit() {
        // Register Events
        $rootScope.$on(userService.EVENT_USER_DATA_CHANGED, onUserDataChanged);
    }

    // ------------------------------------------------------------------------- Event handlers

    function onUserDataChanged() {
        service.onHistoryChanged.raise();
    }

    // --------------------------------------------------------------- Interface implementation

    // function getInvalidCharacters() {
    //     return SearchCriterion.invalidCharacters;
    // }

    function executeQuery(query) {

        // Infer the right dataservice to call depending on the query

        var criteriaDataserviceMap = [
            { criteria: 'field', dataservice: 'dataservice.fullSearch' }
        ];

        _.each(criteriaDataserviceMap, function (map) {
            if (query.hasCriterion(map.criteria)) {
                //var dataserviceInstance = $injector.get(map.dataservice);
            }
        });


        /*var vm;
        var params = query.toStateParams(),
            callService;

        var searchQueryPromise;

        if (vm.params.vnb !== undefined) {
            searchQueryPromise = getPatientByVnb;

        } else if (vm.params.pid !== undefined) {
            //vm.singleResultSearch = true;
            callService = getPatientByPid;
        } else if (vm.params.hospservice !== undefined) {
            callService = getPatientByLocation;
        } else {
            callService = getPatientByCriteria;
        }

        return callService(query).then(function () {

            if (vm.totalRecords === vm.patients.length) {
                vm.isComplete = true;
            }

            if (vm.totalRecords === 0) {
                vm.isEmpty = true;
            } else if (vm.totalRecords === 1) {
                vm.patients[0].isExpanded = true;
            }

        }).catch(function (exception) {
            if (exception.status === 404) {
                vm.isEmpty = true;
            } else {
                vm.isLoadingMore = false;
                $translate('error.ERROR_SERVER').then(function (translation) {
                    logger.error(translation, exception);
                });
            }
        });*/
    }

    function performNavigation(query) {
        var stateName =
            query.hasCriterion('pid') ? ROUTING_STATE_NAME_PATIENT :
                query.hasCriterion('vnb') ? ROUTING_STATE_NAME_VISIT :
                    query.hasCriterion('type') ? ROUTING_STATE_NAME_FULLSEARCH_ENTITY :
                        query.hasCriterion('field') ? ROUTING_STATE_NAME_FULLSEARCH_ALL :
                            ROUTING_STATE_NAME_SEARCH_RESULT;

        $state.go(stateName, query.toStateParams(), {
            'inherit': false,
            'reload': true
        });
    }

    // -------------------------------------------------- Interface implementation: Last search

    function getLastSearches() {
        if (!_.isObject(session.user)) { return []; }

        return session.user.history.lastSearches.map(function (item) { return new SearchQuery(item); });
    }

    function addEntryToHistory(query) {
        if (!_.isObject(session.user)) { return $q.resolve(); }

        // Hash entries to find douplicate entries
        var hashes = _.map(getLastSearches(), function (search) { return search.hash(); });
        var containsQuery = _.includes(hashes, query.hash());

        // Add query if not present in the collectiton
        if (!containsQuery) {
            var queries = session.user.history.lastSearches;
            queries.push(query);
            while (queries.length > SEARCH_HISTORY_ENTRIES_MAX) {
                queries.shift();
            }
            return _saveUserHistory();
        }
        else {
            return $q.resolve();
        }
    }

    function removeEntryFromHistory(query) {
        if (!_.isObject(session.user)) { return $q.resolve(); }

        var history = session.user.history;
        history.lastSearches = _.reject(history.lastSearches, function (item) {
            return _.isEqual(query.hash(), new SearchQuery(item).hash());
        });
        return _saveUserHistory();
    }

    function clearHistory() {
        if (!_.isObject(session.user)) { return; }

        session.user.history.lastSearches = [];
        return _saveUserHistory();
    }

    // -------------------------------------------- Interface implementation: Favorite searches

    function getFavoriteSearches() {
        if (!_.isObject(session.user)) { return []; }

        return session.user.history.favoriteSearches.map(function (item) { return new SearchQuery(item); });
    }

    function addEntryToFavorites(query) {
        if (!_.isObject(session.user)) { return $q.resolve(); }

        // Hash entries to find douplicate entries
        var hashes = _.map(getFavoriteSearches(), function (search) { return search.hash(); });
        var containsQuery = _.includes(hashes, query.hash());

        // Add query if not present in the collectiton
        if (!containsQuery) {
            var queries = session.user.history.favoriteSearches;
            queries.push(query);
            return removeEntryFromHistory(query)
                .then(function () {
                    return _saveUserHistory();
                });
        }
        else {
            return $q.resolve();
        }
    }

    function removeEntryFromFavorites(query) {
        if (!_.isObject(session.user)) { return; }

        var history = session.user.history;
        history.favoriteSearches = _.reject(history.favoriteSearches, function (item) {
            return _.isEqual(query.hash(), new SearchQuery(item).hash());
        });
        return _saveUserHistory();
    }


    // ------------------------------------------------------------------------- Helper methods

    function _saveUserHistory() {
        if (!_.isObject(session.user)) { return; }

        return session.user.setUserData({ history: session.user.history });
    }
}

export default searchQueryService;
