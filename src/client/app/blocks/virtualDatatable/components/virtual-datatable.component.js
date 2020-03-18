import template from './virtual-datatable.component.html';

const virtualDatatable = {
    bindings: {
        pid: '<',
        resetResults: '<',
        options: '<',
        getFilterList: '&',
        getDataList: '&',
        getDataListCount: '&'
    },
    controller: ['$timeout', controller],
    templateUrl: template
};

function controller($timeout) {

    var ctrl = this;

    ctrl.$onInit = onInit;
    ctrl.$onChanges = onChanges;
    ctrl.virtualRepeatCurrentIndex = virtualRepeatCurrentIndex;
    ctrl.onFilter = onFilter;
    ctrl.onSort = onSort;


    // --------------------------------------

    function onInit() {
        ctrl.stateParams = {};
        ctrl.columns = ctrl.options.columns;
        ctrl.footerLabelCode = ctrl.options.footerLabelCode;
        ctrl.filterOptions = ctrl.options.filter;
        ctrl.selectedFilter = null;

        _loadFilterList();
    }

    function onChanges(changesObj) {
        // $onChanges runs before $onInit. Skip first run.
        //if (changesObj.resetResults && changesObj.resetResults.currentValue) {
        ctrl.columns = ctrl.options.columns;
        _buildDynamicItems(ctrl.pid, {});
        ctrl.spin = true;
        ctrl.isScrolling = true;
        //}
    }

    /**
     * Get current/top item index in list while scrolling
     * The first element due be 1
     * @param index
     * @returns {number}
     */
    function virtualRepeatCurrentIndex(index) {
        //if (!isNaN(index)) {
            //$timeout();
            return (index === 0) ? 1 : index + 1;
        //}
    }

    function onFilter(name, value) {
        if(value === 'all') {
            ctrl.selectedFilter = {};
        }
        else {
            ctrl.selectedFilter = {
                filterBy: name,
                filterValue: value
            };
        }

        // how to reset sorting status
        ctrl.resetSorting = true;

        // reset sorting order
        _buildDynamicItems(ctrl.pid, ctrl.selectedFilter);
    }

    function onSort(sortBy, sortDesc) {
        // use sorting with current filter
        var params = {
            sortBy: sortBy,
            sortDesc: sortDesc
        };

        // how to reset sorting status
        ctrl.resetSorting = false;

        if(ctrl.selectedFilter) {
            params.filterBy = ctrl.selectedFilter.filterBy;
            params.filterValue = ctrl.selectedFilter.filterValue;
        }

        _buildDynamicItems(ctrl.pid, params);
    }

    function _loadFilterList() {
        return ctrl.getFilterList()
            .then(function(data) {
                ctrl.filterList = data;
            })
            .catch(function() {
                ctrl.filterList = null;
            });
    }

    // ------------------------------------------------------------------------------------------
    // Getters used by the view to set the values of the placeholders and links in translations
    // ------------------------------------------------------------------------------------------
    function _buildDynamicItems(pid, params) {
        var DynamicItems = function (pid, params) {
            this.pid = pid;

            /**
             * @type {!Object<?Array>} Data pages, keyed by page number (0-index).
             */
            this.loadedPages = {};

            /** @type {number} Total number of items. */
            this.numItems = 0;

            /** @type {number} Index of first item being showed. */
            this.topIndex = 0;

            /** @const {number} Number of items to fetch per request. */
            this.PAGE_SIZE = 20;

            this.filterBy = params.filterBy;
            this.filterValue = params.filterValue;
            this.sortBy = params.sortBy;
            this.sortDesc = params.sortDesc;

            this.fetchNumItems_();
        };

        // Required.
        DynamicItems.prototype.getItemAtIndex = function (index) {
            var pageNumber = Math.floor(index / this.PAGE_SIZE);
            var page = this.loadedPages[pageNumber];

            //console.log('getItemAtIndex:', index);

            if (page) {
                return page[index % this.PAGE_SIZE];
            } else if (page !== null) {
                ctrl.isScrolling = true;
                this.fetchPage_(pageNumber);
            }
        };

        // Required.
        DynamicItems.prototype.getLength = function () {
            return this.numItems;
        };

        DynamicItems.prototype.fetchPage_ = function (pageNumber) {
            var self = this;

            // Set the page to null so we know it is already being fetched.
            this.loadedPages[pageNumber] = null;

            // build params to get data, used by callbacks
            var params = {
                pid: this.pid,
                offset: pageNumber * this.PAGE_SIZE,
                limit: this.PAGE_SIZE,
                filterBy: this.filterBy,
                filterValue: this.filterValue,
                sortBy: this.sortBy,
                sortDesc: this.sortDesc
            };

            ctrl.getDataList({params: params})
                .then(function (logs) {
                    self.loadedPages[pageNumber] = logs;
                    ctrl.spin = false;
                    ctrl.isScrolling = false;
                });
        };

        DynamicItems.prototype.fetchNumItems_ = function () {
            var self = this;

            // build params to get data count, used by callbacks
            var params = {
                pid: this.pid,
                filterBy: this.filterBy,
                filterValue: this.filterValue
            };

            ctrl.getDataListCount({params: params})
                .then(function (count) {
                    self.numItems = count;
                    ctrl.spin = false;
                });
        };

        ctrl.dynamicItems = new DynamicItems(pid, params);
    }
}


export default virtualDatatable;
