// jscs:disable requireParenthesesAroundIIFE
import _ from 'lodash';
import tempate from './icdChop.component.html';

const Icdchop = {
    bindings: {
        vnb: '<'
    },
    templateUrl: tempate,
    controller: controller
};

controller.$inject = [
    '$filter',
    '$q',
    '$scope',
    '$rootScope',
    '$stateParams',
    '$timeout',
    'dataservice.icd',
    'dataservice.interventions',
    'dataservice.chop',
    'sessionService'
];

function controller(
    $filter,
    $q,
    $scope,
    $rootScope,
    $stateParams,
    $timeout,
    dataserviceICD,
    dataserviceInterventions,
    dataserviceCHOP,
    session) {

    var ctrl = this;
    ctrl.title = 'IcdChopController';

    ctrl.preferredLanguage = undefined;

    ctrl.$onInit = onInit;
    ctrl.$onChanges = onChanges;

    ctrl.prettifyIndex = prettifyIndex;

    ctrl.diagnosesDataSource = {};
    ctrl.treatmentsDataSource = {};
    ctrl.interventions = {
        DATE: ''
    };

    ctrl.AUTO_SHRINK_MIN = 4;

    var fnFormatDate = $filter('formatDate');
    var fnTranslate = $filter('translate');

    // Events: Refresh data on language change
    $rootScope.$on('translationChanged', function (e, language) {
        refresh();
    });


    // ------------------------------------------------------------------- Interface operations

    function onInit() {
        var ctrl = this;
        ctrl.vnb = $stateParams.vnb;

        // Load view
        ctrl.preferredLanguage = session.getUILanguage();
        ctrl.diagnosesDataSource = _prepareDiagnosesListDataSource(ctrl.vnb);
        ctrl.treatmentsDataSource = _prepareTreatmentsListDataSource(ctrl.vnb);

        _getInterventionsList(ctrl.vnb);
    }

    function onChanges(changesObj) {
    }

    function refresh() {
        ctrl.preferredLanguage = session.getUILanguage();
    }

    // ----------------------------------------------------------------- Virtual repeater stuff
    /**
     * Get current/top item index in list while scrolling
     * The first element due be 1
     * @param index
     * @returns {number}
     */
    function prettifyIndex(index) {
        try {
            index += 1;
        } finally {
            return index;
        }
    }

    // Diagnoses list view dataSource
    function _prepareDiagnosesListDataSource(visitNumber) {
        var DiagnosesDataSource = function (visitNumber) {
            this.visitNumber = visitNumber;

            /**
             * @type {!Object<?Array>} Data pages, keyed by page number (0-index).
             */
            this.loadedPages = {};

            /** @type {number} Total number of items. */
            this.numItems = 0;

            /** @const {number} Number of items to fetch per request. */
            this.PAGE_SIZE = 20;

            this.fetchNumItems_();
        };

        DiagnosesDataSource.prototype.getItemAtIndex = function (index) {
            var pageNumber = Math.floor(index / this.PAGE_SIZE);
            var page = this.loadedPages[pageNumber];

            if (page) { // If the item is already fetched...
                return page[index % this.PAGE_SIZE];
            }

            // Else fetch another page of results
            this.loadedPages[pageNumber] = {}; // Prevents useless fetching from virtual repeater
            this.fetchPage_(pageNumber);

        };

        DiagnosesDataSource.prototype.getLength = function () {
            return this.numItems;
        };

        DiagnosesDataSource.prototype.isEmpty = function () {
            return !this.getLength();
        };

        DiagnosesDataSource.prototype.fetchPage_ = function (pageNumber) {
            var self = this;
            $timeout(function () {
                self.isBuffering = true;

                var params = {
                    visitNumber: self.visitNumber,
                    pageOffset: pageNumber * self.PAGE_SIZE,
                    sortorder: 'desc',
                    pageSize: self.PAGE_SIZE
                };

                dataserviceICD.getDiagnosisList(params)
                    .then(function (diagnoses) {
                        self.loadedPages[pageNumber] = diagnoses;
                        self.isBuffering = false;
                    });
            });
        };

        DiagnosesDataSource.prototype.fetchNumItems_ = function () {
            var self = this;
            self.isBuffering = true;
            dataserviceICD.getDiagnosisListCount(self.visitNumber)
                .then(function (countJSON) {
                    self.numItems = countJSON["count"];
                    self.isBuffering = false;
                });
        };

        //ctrl.diagnosesDataSource = new DiagnosesDataSource(visitNumber);
        return new DiagnosesDataSource(visitNumber);
    }

    // Treatments list view dataSource
    function _prepareTreatmentsListDataSource(visitNumber) {
        var TreatmentsDataSource = function (visitNumber) {
            this.visitNumber = visitNumber;

            /**
             * @type {!Object<?Array>} Data pages, keyed by page number (0-index).
             */
            this.loadedPages = {};

            /** @type {number} Total number of items. */
            this.numItems = 0;

            /** @const {number} Number of items to fetch per request. */
            this.PAGE_SIZE = 20;

            this.fetchNumItems_();
        };

        // Required.
        TreatmentsDataSource.prototype.getItemAtIndex = function (index) {
            var pageNumber = Math.floor(index / this.PAGE_SIZE);
            var page = this.loadedPages[pageNumber];

            if (page) { // If the item is already fetched...
                return page[index % this.PAGE_SIZE];
            }

            // Else fetch another page of results
            this.loadedPages[pageNumber] = {}; // Prevents useless fetching from virtual repeater
            this.fetchPage_(pageNumber);
        };

        // Required.
        TreatmentsDataSource.prototype.getLength = function () {
            return this.numItems;
        };

        TreatmentsDataSource.prototype.isEmpty = function () {
            return !this.getLength();
        };

        TreatmentsDataSource.prototype.fetchPage_ = function (pageNumber) {
            var self = this;
            $timeout(function () {
                self.isBuffering = true;

                var params = {
                    visitNumber: self.visitNumber,
                    pageOffset: pageNumber * self.PAGE_SIZE,
                    sortorder: 'desc',
                    pageSize: self.PAGE_SIZE
                };
                dataserviceCHOP.getTreatmentList(params)
                    .then(function (treatments) {
                        self.loadedPages[pageNumber] = treatments;
                        self.isBuffering = false;
                    });
            });
        };

        TreatmentsDataSource.prototype.fetchNumItems_ = function () {
            var self = this;
            self.isBuffering = true;
            dataserviceCHOP.getTreatmentListCount(self.visitNumber)
                .then(function (countJSON) {
                    self.numItems = countJSON["count"];
                    self.isBuffering = false;
                });
        };

        return new TreatmentsDataSource(visitNumber);
    }

    // ----------------------------------------------------------------- Interventions handling

    function _getInterventionsList(vnb) {

        ctrl.interventionsLoading = true;

        return dataserviceInterventions
            .getInterventionsByVisitId(vnb)
            .then(function (interventions) {
                ctrl.interventions = !!interventions ? {
                    DATE: fnFormatDate(interventions.interventionDate, 'date'),
                    entries: _createInterventionEntries(interventions)
                } :
                    null;
            })
            .finally(
                function () {
                    ctrl.interventionsLoading = false;
                }
            );
    }

    function _createInterventionEntries(interventions) {
        var diagnoses = _.sortBy(interventions.diagnosis, 'rank');
        var operations = _.sortBy(interventions.operations, 'rank');
        var allRanks = _.map(interventions.diagnosis, 'rank').concat(_.map(interventions.operations, 'rank'));
        var minRank = _.min(allRanks);
        var maxRank = _.max(allRanks);
        var entries = [];
        var rank = minRank;
        while (rank <= maxRank) {
            var diagnosis = _.find(diagnoses, { rank: rank });
            var operation = _.find(operations, { rank: rank });
            if (diagnosis || operation) {
                entries.push({
                    DIAGNOSIS: (diagnosis) ? diagnosis.description : fnTranslate('visit.NOT_SPECIFIED'),
                    OPERATION: (operation) ? operation.description : fnTranslate('visit.NOT_SPECIFIED')
                });
            }
            rank++;
        }

        return entries;
    }

}

export default Icdchop;
