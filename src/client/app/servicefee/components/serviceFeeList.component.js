import templat from './serviceFeeList.component.html';

const serviceFeeList = {
    templateUrl: templat,
    controller: controller,
    bindings: {
        vnb: '<',
        filterValue: '<',
        filterBy: '<',
        sortDirection: '<'
    }
};

controller.$inject = [
    '$q',
    'sessionService',
    'dataservice.servicefees',
    'servicefeeDetail'
];

function controller($q, session, dataserviceServiceFees, servicefeeDetail) {
    /*jshint validthis: true */
    var ctrl = this;

    ctrl.MAX_ROWS_BEFORE_SCROLL = 3;
    //height in px
    ctrl.ROW_HEIGHT_NO_SCROLL = 53;
    ctrl.ROW_HEIGHT_SCROLL = 52;

    // events
    ctrl.$onInit = onInit;
    // public methods
    ctrl.showDetail = showDetail;
    ctrl.canShowDetail = canShowDetail;

    // ---------------------------------- Events

    function onInit() {
        _buildDynamicItems();
    }

    // ---------------------------------- Public methods

    function showDetail($event, serviceFee) {
        servicefeeDetail.showServicefeeDetail($event, serviceFee);
    }

    function canShowDetail(benefit) {
        if (benefit && (benefit.note || benefit.hasPhysician)) {
            return true;
        } else {
            return false;
        }
    }

    // --------------------------------- Helper methods

    function _buildDynamicItems() {
        var DynamicItems = function () {
            /**
             * @type {!Object<?Array>} Data pages, keyed by page number (0-index).
             */
            this.loadedPages = {};

            /** @type {number} Total number of items. */
            this.numItems = 0;

            /** @const {number} Number of items to fetch per request. */
            this.PAGE_SIZE = 5;

            this.pageNumber = 0;

            this.fetchNumItems_();
        };

        // Required.
        DynamicItems.prototype.getItemAtIndex = function (index) {
            var pageNumber = Math.floor(index / this.PAGE_SIZE);
            var page = this.loadedPages[pageNumber];

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
            ctrl.isLoading = true;

            var self = this;

            this.pageNumber = pageNumber;

            // Set the page to null so we know it is already being fetched.
            this.loadedPages[pageNumber] = null;

            var offset = pageNumber * this.PAGE_SIZE;
            var limit = this.PAGE_SIZE;

            var params = {
                visitnb: ctrl.vnb,
                lang: session.getUILanguage(),
                offset: pageNumber * this.PAGE_SIZE,
                limit: this.PAGE_SIZE,
                orderby: 'benefitdt',
                sortorder: ctrl.sortDirection,
                filterby: ctrl.filterBy,
                filtervalue: ctrl.filterValue
            };

            dataserviceServiceFees
                .getServiceFeeList(params)
                .then(function (result) {
                    self.loadedPages[pageNumber] = result;
                    ctrl.isScrolling = false;
                    ctrl.isLoading = false;
                })
                .catch(function () {
                    ctrl.isScrolling = false;
                    ctrl.isLoading = false;
                });
        };

        DynamicItems.prototype.fetchNumItems_ = function () {
            ctrl.isLoading = true;
            var self = this;

            var params = {
                visitnb: ctrl.vnb,
                orderby: 'benefitdt',
                sortorder: ctrl.sortDirection,
                filterby: ctrl.filterBy,
                filtervalue: ctrl.filterValue
            };

            dataserviceServiceFees
                .getServiceFeeCount(params)
                .then(function (result) {
                    self.numItems = result;
                    ctrl.isLoading = false;
                })
                .catch(function () {
                    self.numItems = 0;
                    ctrl.isLoading = false;
                });
        };

        ctrl.dynamicItems = new DynamicItems();
    }

}

export default serviceFeeList;
