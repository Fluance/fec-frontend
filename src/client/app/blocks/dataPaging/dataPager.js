/*jshint -W101*/ //  Line too long

dataPagerService.$inject = ['$q', '$translate', 'logger'];

/**
* @ngdoc service
* @module blocks.datePaging
* @name dataPagerService
* @description
*
* The dependency injectable service that provides the constructor of the DataPager object.
*/
function dataPagerService($q, $translate, logger) {
    DataPager.$q = $q;
    DataPager.$translate = $translate;
    DataPager.logger = logger;
    return DataPager;
}

/**
* @ngdoc object
* @module blocks.datePaging
* @name dataPager
* @description
*
* The business logic for loading of data page-by-page.
*/
function DataPager() {
    var self = this;

    var isPageIndexChanging = false;

    // Properties
    this.pageIndex = -1;
    this.pageSize = 0;
    this.totalItemsCount = -1;
    this.sortBy = undefined;
    this.sortDirection = undefined;
    this.items = [];
    this.isLoading = false;
    this.hasTotalItemsCount = false;

    // Public methods
    this.canGetNextPage = canGetNextPage;
    this.isEmpty = isEmpty;
    this.getNextPage = getNextPage;
    this.reset = reset;
    this.setTotalItemsCount = setTotalItemsCount;
    this.setItems = setItems;

    // Public function pointers (to be provided by the consumer of the DataPager)
    this.loadPage = undefined;

    // Initialization
    this.reset();
    return this;

    // --------------------------------------------------------------- Interface implementation

    /**
     * @ngdoc method
     * @name dataPager#canGetNextPage
     * @description
     *
     * Gets the value indicating, whether there are more pages to load.
     * Calling getNextPage when canGetNextPage is false, will have no loading effect.
     */
    function canGetNextPage() {
        return (self.pageIndex === -1) || (((self.pageIndex + 1) * self.pageSize) < self.totalItemsCount);
    }

    /**
     * @ngdoc method
     * @name dataPager#isEmpty
     * @description
     *
     * Gets the value indicating, whether there is data available.
     * isEmpty is true, when at least one page was loaded and no data was returned.
     */
    function isEmpty() {
        return (!isPageIndexChanging && self.pageIndex === 0) && (self.hasTotalItemsCount && self.totalItemsCount === 0);
    }

    /**
     * @ngdoc method
     * @name dataPager#getNextPage
     * @description
     *
     * Increments the pageIndex and loads so the data for the next page.
     * Calling this method when canGetNextPage is false, will have no loading effect.
     */
    function getNextPage() {
        if (canGetNextPage()) {
            isPageIndexChanging = true;
            self.pageIndex++;
            return _getPage()
                .finally(function() {
                    isPageIndexChanging = false;
                });
        }
        else {
            return DataPager.$q.resolve();
        }
    }

    /**
     * @ngdoc method
     * @name dataPager#reset
     * @description
     *
     * Resets this instance to its initial state.
     * This deletes all pages loaded so far and resets the pageIndex to -1.
     */
    function reset() {
        self.pageIndex = -1;
        self.items = [];
        self.hasTotalItemsCount = false;
        self.totalItemsCount = 0;
        self.isLoading = false;
    }

    function setTotalItemsCount(count) {
        self.totalItemsCount = count;
        self.hasTotalItemsCount = true;
    }

    /**
     * @ngdoc method
     * @name dataPager#setItems
     * @description
     *
     * Sets items directly (bypass initial load by DataPager, and use DataPager to handle pagination).
     *
     * Should be used only for something like setting the initial load. Must always respect page size (multiplicity) when there is
     * still pagination on this initial load.
     */
    function setItems(items) {
        if(_.isUndefined(items) || !_.isArray(items) || _.isUndefined(self.pageSize)) {
            return false;
        }

        // set items...
        self.items = [];
        for (var i = 0; i < items.length; i++) {
            self.items.push(items[i]);
        }

        // ... and adjust the state
        self.pageIndex = Math.ceil(items.length / self.pageSize) - 1;
    }

    // -------------------------------------------------------------------------- Data handling

    function _getPage() {
        // Validate
        if (!_.isFunction(self.loadPage)) {
            throw new Error('No implementation provided for method \'loadPage\'.');
        }
        if (self.loadPage.length !== 4) {
            throw new Error('Wrong signature for method \'loadPage\'. Expected: function(pageIndex, pageSize, sortBy, sortDirection)');
        }

        // Load page for current pageIndex
        var loadPageResult = self.loadPage(self.pageIndex, self.pageSize, self.sortBy, self.sortDirection);
        if (!_.isObject(loadPageResult) || !_.isFunction(loadPageResult.then)) {
            throw new Error('Function \'loadPage\' must return a Promise returning the loaded records or an empty array.');
        }

        self.isLoading = true;
        return loadPageResult
            .then(function(items) {
                if (_.isArray(items)) {
                    for (var i = 0; i < items.length; i++) {
                        self.items.push(items[i]);
                    }
                }
                else {
                    throw new Error('Function \'loadPage\' must return a Promise returning the loaded records or an empty array.');
                }
            })
            .catch(function(exception) {
                switch (exception.status) {
                    case 404:
                        // No records found -> nothing to do
                        break;

                    default:
                        DataPager.$translate('error.ERROR').then(function(translation) {
                            DataPager.logger.error(translation, exception);
                        });
                        break;
                }
            })
            .finally(function() {
                self.isLoading = false;
            });
    }
}

export default dataPagerService;
