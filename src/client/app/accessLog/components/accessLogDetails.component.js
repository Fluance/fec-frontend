import template from './accessLogDetails.component.html';

const AccessLogDetails = {
    bindings: {
        pid: '<',
        item: '<',
        isExpanded: '<'
    },
    controller: ['dataservice.accessLogs', '$timeout', controller],
    templateUrl: template
};

function controller(dataserviceAccessLogs, $timeout) {

    var ctrl = this;

    ctrl.$onInit = onInit;
    ctrl.$onChanges = onChanges;
    ctrl.virtualRepeatCurrentIndex = virtualRepeatCurrentIndex;

    // --------------------------------------

    function onInit() {
        ctrl.stateParams = {};
    }

    function onChanges(changesObj) {
        // $onChanges runs before $onInit. Skip first run.
        if (changesObj.isExpanded && changesObj.isExpanded.currentValue) {
            _buildDynamicItems(ctrl.pid, ctrl.item.user.username.split('/')[0], ctrl.item.user.username.split('/')[1],
                ctrl.item.detailUrl);
            ctrl.spin = true;
            ctrl.isScrolling = true;
        }
    }

    /**
     * Get current/top item index in list while scrolling
     * The first element due be 1
     * @param index
     * @returns {number}
     */
    function virtualRepeatCurrentIndex(index) {
        if (!isNaN(index)) {
            $timeout();
            return (index === 0) ? 1 : index + 1;
        }
    }

    // ------------------------------------------------------------------------------------------
    // Getters used by the view to set the values of the placeholders and links in translations
    // ------------------------------------------------------------------------------------------
    function _buildDynamicItems(pid, domain, username, detailUrl) {
        var DynamicItems = function (pid, domain, username, detailUrl) {
            this.pid = pid;
            this.domain = domain;
            this.username = username;
            this.detailUrl = detailUrl;

            /**
             * @type {!Object<?Array>} Data pages, keyed by page number (0-index).
             */
            this.loadedPages = {};

            /** @type {number} Total number of items. */
            this.numItems = 0;

            /** @const {number} Number of items to fetch per request. */
            this.PAGE_SIZE = 20;

            this.limit = 0;

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
            var self = this;

            // Set the page to null so we know it is already being fetched.
            this.loadedPages[pageNumber] = null;

            var params = {
                pid: this.pid,
                detailUrl: this.detailUrl,
                offset: pageNumber * this.PAGE_SIZE,
                sortorder: 'desc',
                limit: this.PAGE_SIZE
            };

            dataserviceAccessLogs.getAccessLogsDetailsWithUrl(params)
                .then(function (logs) {
                    self.loadedPages[pageNumber] = logs;
                    self.limit = ((pageNumber * self.PAGE_SIZE) + logs.length);

                    ctrl.spin = false;
                    ctrl.isScrolling = false;
                });
        };

        DynamicItems.prototype.fetchNumItems_ = function () {
            var self = this;

            dataserviceAccessLogs.getAccessLogsDetailsWithUrlCount(self.pid, self.detailUrl)
                .then(function (count) {
                    self.numItems = count;
                    ctrl.spin = false;
                });
        };

        ctrl.dynamicItems = new DynamicItems(pid, domain, username, detailUrl);
    }
}

export default AccessLogDetails;
