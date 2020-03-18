import template from './roomListAmb.extended.component.html';

const RoomListAmbExt = {
    bindings: {
        params: '<',
        error: '<',
        warning: '<',
        defaultSelect: '<',
        count: '<',
        showSettings: '='
    },
    controller: [
        '$filter',
        '$rootScope',
        '$stateParams',
        'dataPager',
        'dataservice.patients',
        'dataservice.rooms',
        'logger',
        'sessionService',
        'userAgentService',
        'waitForRendering',
        controller
    ],
    templateUrl: template
};

function controller(
    $filter,
    $rootScope,
    $stateParams,
    DataPager,
    dataServicePatients,
    dataServiceRooms,
    logger,
    session,
    userAgent,
    waitForRendering
) {
    let unsubscribeCompanyChanged;
    let unsubscribeSelectedServiceChanged;
    let unsubscribeSelectedUnitChanged;

    var PATIENT_CLASS_IN_PATIENT = 'O';

    var companyId, hospService, unit;

    var ctrl = this;

    ctrl.TYPE_LETTER = 'letter';
    ctrl.TYPE_DATE = 'date';
    ctrl.SORT_BY_PATIENT_NAME = 'patientName';
    ctrl.SORT_BY_ADMISSION_DATE = 'admissionDate';

    // Sort options
    ctrl.sortCriteria = [
        {key: ctrl.SORT_BY_PATIENT_NAME, name: 'dashboard.PATIENTS_NAME'},
        {key: ctrl.SORT_BY_ADMISSION_DATE, name: 'dashboard.ADMIT_DATE_SHORT'}
    ];
    ctrl.selectedSortCriteria = ($stateParams.orderby) ? $stateParams.orderby : (ctrl.sortCriteria.length > 0) ? ctrl.sortCriteria[0].key : undefined;
    ctrl.selectedSortDirection = ($stateParams.sortorder) ? $stateParams.sortorder : 'asc';

    ctrl.groups = {};
    ctrl.patientViewModels = [];

    ctrl.$onInit = onInit;
    ctrl.$onDestroy = onDestroy;
    ctrl.refresh = refresh;
    ctrl.scrollToSelectedIndex = scrollToSelectedIndex;
    ctrl.getPatientViewModels = getPatientViewModels;

    // ------------------------------------------------------------------------- Event handling

    function onInit() {
        ctrl.isLoaded = false;

        // Init parameters
        companyId = session.user.companyId;
        hospService = undefined;
        unit = undefined;

        // Events and set parameters
        unsubscribeCompanyChanged = $rootScope.$on(session.EVENT_SELECTED_COMPANY_CHANGED, _onCompanyChanged);
        if (!_.isEmpty(ctrl.params)) {
            switch (ctrl.params.by) {
                case 'services':
                    hospService = ctrl.params.code;
                    unsubscribeSelectedServiceChanged = $rootScope.$on(session.EVENT_SELECTED_SERVICE_CHANGED, _onServiceChanged);
                    break;
                case 'units':
                    unit = ctrl.params.code;
                    unsubscribeSelectedUnitChanged = $rootScope.$on(session.EVENT_SELECTED_UNIT_CHANGED, _onUnitChanged);
                    break;
            }
        }

        _loadPatients();

        waitForRendering.wait(function () {
            if (!_.isUndefined(ctrl.defaultSelect) && ctrl.defaultSelect !== null) {
                scrollToSelectedIndex(ctrl.defaultSelect);
            }
        });
    }

    function onDestroy() {
        if(unsubscribeCompanyChanged) {unsubscribeCompanyChanged();}
        if(unsubscribeSelectedServiceChanged) {unsubscribeSelectedServiceChanged();}
        if(unsubscribeSelectedUnitChanged) {unsubscribeSelectedUnitChanged();}
    }

    // ------------------------------------------------------------------------- Interface methods

    function getPatientViewModels() {
        var patientsVM = [];
        var orderedGroups = [];

        // sort ViewModel by keys (asc/desc)
        var keys = _.keys(ctrl.groups).sort(); // ascending (alphabetically)
        keys = ctrl.selectedSortDirection === 'asc' ? keys : keys.reverse(); // descending
        _.each(keys, function(key) {
            orderedGroups.push(ctrl.groups[key]); // create ordered array
        });

        _.each(orderedGroups, function(group) {
            var nextFirstElement = patientsVM.length;
            patientsVM = patientsVM.concat(group.patientViewModels);
            patientsVM[nextFirstElement].showIndex = true; // is first element? yes, show index value
            patientsVM[nextFirstElement].type = group.type; // eg. PATIENT_NAME, ADMISSION_DATE
            patientsVM[nextFirstElement].date = group.date; // visit admission date
            patientsVM[nextFirstElement].index = group.index; // index value: eg. patient name, visit admission date
        });
        ctrl.patientsVM = patientsVM;
        return patientsVM;
    }

    /**
     * Scroll to index position
     * @param indexValue
     */
    function scrollToSelectedIndex(indexValue) {
        if (_.isString(indexValue)) {
            // Update selection
            ctrl.selectedGroupNumber = indexValue;

            // Count patients of all groups preceding the selected group
            var count = 0;
            _.each(ctrl.indexGroups, function(item) {
                if (item.value !== indexValue) {
                    count += item.count;
                } else {
                    return false; // Group found, stop counting
                }
            });

            ctrl.topIndex = count;
        }
    }

    function refresh() {
        ctrl.isLoaded = false;
        ctrl.groups = {};
        ctrl.topIndex = 0;

        _loadPatients();
    }

    // ------------------------------------------------------------------------- Helper methods

    /**
     * Handle when company changes
     * @private
     */
    function _onCompanyChanged() {
        companyId = session.user.companyId;
        //It's not necessary load the rooms because the event for change service or unit will be fired
        //refresh();
    }

    /**
     * Handle when service changes
     * @private
     */
    function _onServiceChanged() {
        hospService = ctrl.params.code;
        refresh();
    }

    /**
     * Handle when unit changes
     * @private
     */
    function _onUnitChanged() {
        unit = ctrl.params.code;
        refresh();
    }

    /**
     * Load the patients of AMB
     * @private
     */
    function _loadPatients() {
        if (ctrl.selectedSortCriteria === ctrl.SORT_BY_ADMISSION_DATE) {
            _loadPatientsByGroup(_loadPatientsByAdmissionDateIndex, _buildPatientsByDateDynamicItems);
        }
        else if (ctrl.selectedSortCriteria === ctrl.SORT_BY_PATIENT_NAME) {
            _loadPatientsByGroup(_loadPatientsByPatientNameIndex, _buildPatientsByNameDynamicItems);
        }
    }

    /**
     * Load patients grouped by a given criteria (eg: by Date, by Name)
     * @private
     */
    function _loadPatientsByGroup(fnBuildIndexForPatients, fnBuildPatientsDynamicItems) {
        fnBuildIndexForPatients()
            .then(function(index) {
                if(!_.isEmpty(index)) {
                    // prepare ViewModel
                    ctrl.patientsDynamicItems = fnBuildPatientsDynamicItems(companyId, unit, hospService, PATIENT_CLASS_IN_PATIENT, ctrl.indexGroups);
                }
            });
    }

    function _loadPatientsByAdmissionDateIndex() {
        var options = {
            companyid: companyId,
            patientunit: unit,
            hospservice: hospService,
            patientclass: 'O',
            sortorder: ctrl.selectedSortDirection
        };

        return dataServicePatients.getPatientsCountByAdmissionDate(options)
            .then(function(patientGroupsByDate) {
                var lastCount = 0;
                ctrl.indexGroups = [];

                if(_.isEmpty(patientGroupsByDate)) {
                    ctrl.hasData = false;
                    ctrl.isLoaded = true;
                }
                else {
                    // check sort direction => reverse index
                    if (ctrl.selectedSortDirection === 'desc') {
                        // reverse
                        patientGroupsByDate.reverse();
                    }

                    _.forEach(patientGroupsByDate, function (patientsGroup) {
                        // only add letters with patients
                        if (patientsGroup.count > 0) {
                            ctrl.hasData = true;

                            // build index (patient groups)
                            ctrl.indexGroups.push({
                                value: patientsGroup.date,
                                count: patientsGroup.count,
                                offset: lastCount,
                                displayValue: patientsGroup.date
                            });

                            lastCount += patientsGroup.count;
                        }
                    });

                    ctrl.hasData = true;
                    ctrl.isLoaded = true;
                }

                return ctrl.indexGroups;
            });
    }


    /**
     * Build index of groups by 'patient last name' (eg: A-Z)
     * @private
     */
    function _loadPatientsByPatientNameIndex() {
        ctrl.letterGrid = {};

        var options = {
            companyid: companyId,
            patientunit: unit,
            hospservice: hospService,
            patientclass: 'O',
            sortorder: ctrl.selectedSortDirection
        };

        return dataServicePatients.getPatientsCountByName(options)
            .then(function(patientGroupsByName) {
                var lastCount = 0;
                ctrl.indexGroups = [];

                if(_.isEmpty(patientGroupsByName)) {
                    ctrl.hasData = false;
                    ctrl.isLoaded = true;
                }
                else {
                    // check sort direction => reverse index
                    if (ctrl.selectedSortDirection === 'desc') {
                        // reverse
                        patientGroupsByName.reverse();
                    }

                    _.forEach(patientGroupsByName, function (patientsGroup) {
                        // only add letters with patients
                        if (patientsGroup.count > 0) {
                            ctrl.hasData = true;
                            // get patient last name letter (patient group)
                            var letter = patientsGroup.lastName;

                            // build index (patient groups)
                            ctrl.indexGroups.push({
                                id: 'letter' + letter,
                                value: letter,
                                count: patientsGroup.count,
                                offset: lastCount,
                                displayValue: letter
                            });

                            lastCount += patientsGroup.count;
                        }
                    });

                    ctrl.hasData = true;
                    ctrl.isLoaded = true;
                }

                return ctrl.indexGroups;
            });
    }

    /**
     * Create the structure of index (patient groups: by admission date) dynamically
     * @private
     */
    function _createIndex() {
        ctrl.indexGroups = [];
        _.each(ctrl.groups, function (group) {
            ctrl.indexGroups.push({
                value: group.value,
                displayValue: group.displayValue,
                count: group.nbPatients
            });
        });
    }


    /**
     * Creates object that handles pagination of patients filtered by 'patient last name'
     * @param companyId
     * @param unit
     * @param hospService
     * @param patientClass
     * @param indexGroups
     * @private
     */
    function _buildPatientsByNameDynamicItems(companyId, unit, hospService, patientClass, indexGroups) {

        /**
         * Pagination
         * Fetch a new page of results. The page size is constant.
         * @param pageNumber page number
         * @private
         */
        function fetchPage(pageNumber) {
            var self = this;

            // Set the page to null so we know it is already being fetched.
            this.loadedPages[pageNumber] = null;

            var params = {
                companyid: this.companyId,
                patientunit: this.unit,
                hospservice: this.hospService,
                patientclass: this.patientClass,
                offset: pageNumber * this.PAGE_SIZE,
                orderby: 'lastname',
                sortorder: ctrl.selectedSortDirection,
                limit: this.PAGE_SIZE
            };

            dataServicePatients.getPatientByRoomList(params)
                .then(function (results) {
                    var page = results.patients;

                    self.loadedPages[pageNumber] = page;
                    self.checkFirstGroupElementsInPage(pageNumber, page);

                    ctrl.spin = false;
                    ctrl.isScrolling = false;
                });
        }

        return new DynamicItems(companyId, unit, hospService, patientClass, indexGroups, fetchPage);
    }

    /**
     * Creates object that handles pagination of patients filtered by 'admission date'
     * @param companyId
     * @param unit
     * @param hospService
     * @param patientClass
     * @param indexGroups
     * @private
     */
    function _buildPatientsByDateDynamicItems(companyId, unit, hospService, patientClass, indexGroups) {

        /**
         * Pagination
         * Fetch a new page of results. The page size is constant.
         * @param pageNumber page number
         * @private
         */
        function fetchPage(pageNumber) {
            var self = this;

            // Set the page to null so we know it is already being fetched.
            this.loadedPages[pageNumber] = null;

            var params = {
                companyid: this.companyId,
                patientunit: this.unit,
                hospservice: this.hospService,
                patientclass: this.patientClass,
                offset: pageNumber * this.PAGE_SIZE,
                orderby: 'admitdt',
                sortorder: ctrl.selectedSortDirection,
                limit: this.PAGE_SIZE
            };

            dataServicePatients.getPatientByRoomList(params)
                .then(function (results) {
                    var page = results.patients;

                    self.loadedPages[pageNumber] = page;
                    self.checkFirstGroupElementsInPage(pageNumber, page);

                    ctrl.spin = false;
                    ctrl.isScrolling = false;
                });
        }

        return new DynamicItems(companyId, unit, hospService, patientClass, indexGroups, fetchPage);
    }


    /**
     * List with dynamically loaded items (patients)
     * @param companyId
     * @param unit
     * @param hospService
     * @param patientClass
     * @param indexGroups
     * @param fnFetchPage
     * @constructor
     */
    var DynamicItems = function (companyId, unit, hospService, patientClass, indexGroups, fnFetchPage) {
        this.companyId = companyId;
        this.unit = unit;
        this.hospService = hospService;
        this.patientClass = patientClass;
        this.indexGroups = indexGroups;
        this.fnFetchPage = fnFetchPage;

        /**
         * @type {!Object<?Array>} Data pages, keyed by page number (0-index).
         */
        this.loadedPages = {};

        /** @type {number} Total number of items. */
        this.numItems = 0;

        /** @const {number} Number of items to fetch per request. */
        this.PAGE_SIZE = 40;

        this.fetchNumItems_();
    };

    DynamicItems.prototype.getItemAtIndexScrolling = function(index) {
        // remove negative values while scrolling
        if(index < 0) {
            index = 0;
        }
        return this.getItemAtIndex(index);
    };

    // REQUIRED by API
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

    // REQUIRED by API
    DynamicItems.prototype.getLength = function () {
        return this.numItems;
    };

    /**
     * Pagination
     * Fetch a new page of results. The page size is constant.
     * @param pageNumber page number
     * @private
     */
    DynamicItems.prototype.fetchPage_ = function(pageNumber) {
        return this.fnFetchPage(pageNumber);
    };

    /**
     * Sets the total number of items in the dynamic list
     * @private
     */
    DynamicItems.prototype.fetchNumItems_ = function () {
        var self = this;
        var count = 0;

        // use indexGroups to count total number of out patients
        _.each(self.indexGroups, function (group) {
            count += group.count;
        });

        self.numItems = count;
        ctrl.spin = false;
    };

    /**
     * Mark elements in page that are the first elements of group
     * @param pageNumber
     */
    DynamicItems.prototype.checkFirstGroupElementsInPage = function (pageNumber, page) {
        var self = this;
        var startOffset = pageNumber * this.PAGE_SIZE;
        var endOffset = startOffset + this.PAGE_SIZE;
        var firstGroupElements = this.getFirstGroupElementsInRange(startOffset, endOffset);

        // set 'showIndex' = true for patients in page that are the first patient of a group
        _.each(firstGroupElements, function (element) {
            // prevent user notification msg (popup) when there is a JS error (eg: mismatch between index and list)
            if(page[element.offset % self.PAGE_SIZE]) {
                page[element.offset % self.PAGE_SIZE].showIndex = true;
                page[element.offset % self.PAGE_SIZE].displayValue = element.groupDisplayValue;
            }
        });
    };

    /**
     * Returns an array with offsets within the range specified that correspond to the first element(s) of groups.
     * @param startOffset start offset in dynamic list (eg: 40)
     * @param endOffset end offset in dynamic list (eg: 80)
     * @returns {Array}
     */
    DynamicItems.prototype.getFirstGroupElementsInRange = function (startOffset, endOffset) {
        var self = this;
        var firstGroupElements = [];
        var foundOffset = false;
        _.each(self.indexGroups, function (group) {
            var offset = group.offset;
            if (offset >= startOffset && offset < endOffset) {
                foundOffset = true;
                firstGroupElements.push({offset: offset, groupDisplayValue: group.displayValue});
            }
            else {
                if (foundOffset) {
                    return false;
                }
            }
        });
        return firstGroupElements;
    };
}

export default RoomListAmbExt;
