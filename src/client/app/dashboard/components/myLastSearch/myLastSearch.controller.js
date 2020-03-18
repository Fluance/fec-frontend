// Constants
const VIEW_LAST_SEARCHES = 'view-last-searches';
const VIEW_FAVORITE_SEARCH = 'view-favorite-searches';

lastSearchController.$inject = [
    'searchQueryService'
];

function lastSearchController(searchQueryService) {
    var onHistoryChangedEventSubscription;

    /*jshint validthis: true */
    var vm = this;

    // Properties
    vm.view = VIEW_LAST_SEARCHES;
    vm.lastSearches = [];
    vm.favoriteSearches = [];
    vm.hasLastSearchItems = function() { return vm.lastSearches.length > 0; };
    vm.hasFavoriteSearchItems = function() { return vm.favoriteSearches.length > 0; };
    vm.isViewLastSearches = function() { return vm.view === VIEW_LAST_SEARCHES; };
    vm.isViewFavoriteSearches = function() { return vm.view === VIEW_FAVORITE_SEARCH; };

    // Actions
    vm.markAsFavorite = markAsFavorite;
    vm.removeSearch = removeSearch;
    vm.removeFavorite = removeFavorite;
    vm.clearLastSearches = clearLastSearches;
    vm.selectViewLastSearches = function() { vm.view = VIEW_LAST_SEARCHES; };
    vm.selectViewFavoriteSearches = function() { vm.view = VIEW_FAVORITE_SEARCH; };
    vm.disableLastSearchesTab = function () {
        return !vm.hasLastSearchItems() && vm.hasFavoriteSearchItems();
    };
    vm.disableFavoriteSearchesTab = function () {
        return !vm.hasFavoriteSearchItems();
    };

    vm.$onInit = onInit;
    vm.$onDestroy = onDestroy;
    return vm;

    // ------------------------------------------------------------------------- Initialization

    function onInit() {
        onHistoryChangedEventSubscription = searchQueryService.onHistoryChanged.subscribe(onHistoryChanged);
        _refresh();
    }

    function onDestroy() {
        if (onHistoryChangedEventSubscription) { onHistoryChangedEventSubscription.unsubscribe(); }
    }

    // --------------------------------------------------------------- Interface implementation

    function markAsFavorite(index) {
        var searchToMarkAsFavorite = vm.lastSearches[index];
        searchQueryService
            .addEntryToFavorites(searchToMarkAsFavorite)
            .then(function() {
                _refresh();
            });
    }

    function removeSearch(index) {
        var searchToDelete = vm.lastSearches[index];
        searchQueryService
            .removeEntryFromHistory(searchToDelete)
            .then(function() {
                _refresh(undefined, undefined, true);
            });
    }

    function clearLastSearches() {
        searchQueryService
            .clearHistory()
            .then(function() {
                _refresh(true, false);
            });
    }

    function removeFavorite(index) {
        var searchToDelete = vm.favoriteSearches[index];
        searchQueryService
            .removeEntryFromFavorites(searchToDelete)
            .then(function() {
                _refresh(false, true, false);
            });
    }

    // -------------------------------------------------------------------------- Event handler

    function onHistoryChanged(args) {
        _refresh();
    }

    // ------------------------------------------------------------------------- Helper methods

    function _refresh(refreshLastSearches, refreshFavoriteSearches, fromSearch) {
        // Initialize optional parameters
        if (_.isUndefined(refreshLastSearches)) { refreshLastSearches = true; }
        if (_.isUndefined(refreshFavoriteSearches)) { refreshFavoriteSearches = true; }

        if (refreshLastSearches) {
            vm.lastSearches = _.sortBy(searchQueryService.getLastSearches(), 'timeStamp').reverse();
        }
        if (refreshFavoriteSearches) {
            vm.favoriteSearches = _.sortBy(searchQueryService.getFavoriteSearches(), 'timeStamp').reverse();
        }

        //After refreshing, select the Favorites when setting a search as favourite. Otherwise, select the tab we are in, except when there are no favorites items
        if (vm.hasFavoriteSearchItems() && !fromSearch) {
            vm.selectViewFavoriteSearches();
        } else {
            vm.selectViewLastSearches();
        }
    }
}

export default lastSearchController;
