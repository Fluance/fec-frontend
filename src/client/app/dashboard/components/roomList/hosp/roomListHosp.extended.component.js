import template from './roomListHosp.extended.component.html';

const RoomListHospExt = {
    bindings: {
        params: '<',
        error: '<',
        warning: '<',
        count: '<',
        showSettings: '='
    },
    controller: ['$rootScope', '$stateParams', '$q', 'dataPager', 'dataservice.patients', 'dataservice.rooms', 'dataservice.whiteboard', 'logger', 'sessionService', controller],
    templateUrl: template
};

function controller($rootScope, $stateParams, $q, DataPager, dataServicePatients, dataServiceRooms, dataServiceWhiteboard, logger, session) {
    let unsubscribeCompanyChanged;
    let unsubscribeSelectedServiceChanged;
    let unsubscribeSelectedUnitChanged;

    var PATIENT_CLASS_IN_PATIENT = 'I';
    var OFFSET_GET_ROOMS = 0;
    var ROOM_COUNT_LIMIT = 4000;
    var ROOM_COUNT_MAX_PATIENTS_BY_ROOM = 1;

    var companyId, hospService, unit;
    var ctrl = this;

    ctrl.SORT_BY_ROOM = 'room';
    ctrl.SORT_BY_PATIENT_NAME = 'patientName';

    ctrl.maxPatientsByRoom = 0;

    // Sort options
    ctrl.sortCriteria = [
        {key: ctrl.SORT_BY_ROOM, name: 'dashboard.ROOM'},
        {key: ctrl.SORT_BY_PATIENT_NAME, name: 'dashboard.PATIENTS_NAME'}
    ];

    ctrl.selectedSortCriteria = ($stateParams.orderby) ? $stateParams.orderby : (ctrl.sortCriteria.length > 0) ? ctrl.sortCriteria[0].key : undefined;
    ctrl.selectedSortDirection = ($stateParams.sortorder) ? $stateParams.sortorder : 'asc';

    ctrl.$onInit = onInit;
    ctrl.$onDestroy = onDestroy;
    ctrl.refresh = refresh;
    ctrl.scrollToSelectedIndex = scrollToSelectedIndex;
    ctrl.getFirstLetterDisplayValue = getFirstLetterDisplayValue;
    ctrl.getRoomDisplayValue = getRoomDisplayValue;

    // ------------------------------------------------------------------------- Event handling

    function onInit() {
        ctrl.isLoaded = false;
        ctrl.isExpanded = true;
        ctrl.hasData = true;

        // Init parameters
        companyId = session.user.companyId;
        hospService = undefined;
        unit = undefined;

        // Events and set parameters
        $rootScope.$on(session.EVENT_SELECTED_COMPANY_CHANGED, _onCompanyChanged);
        if (!_.isEmpty(ctrl.params)) {
            switch (ctrl.params.by) {
                case 'services':
                    hospService = ctrl.params.code;
                    $rootScope.$on(session.EVENT_SELECTED_SERVICE_CHANGED, _onServiceChanged);
                    break;
                case 'units':
                    unit = ctrl.params.code;
                    $rootScope.$on(session.EVENT_SELECTED_UNIT_CHANGED, _onUnitChanged);
                    break;
            }
        }

        _loadPatients();
    }

    function onDestroy() {
        if(unsubscribeCompanyChanged) {unsubscribeCompanyChanged();}
        if(unsubscribeSelectedServiceChanged) {unsubscribeSelectedServiceChanged();}
        if(unsubscribeSelectedUnitChanged) {unsubscribeSelectedUnitChanged();}
    }

    function refresh() {
        ctrl.isLoaded = false;
        ctrl.hasData = true;
        ctrl.roomVMs = [];
        ctrl.indexGroups = {};
        ctrl.topIndex = 0;
        _loadPatients();
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

    function getRoomDisplayValue(patientInfo) {
        return patientInfo.visit.patientroom;
    }

    function getFirstLetterDisplayValue(patientInfo) {
        return  patientInfo.patient.lastName.substring(0,1).toUpperCase();
    }

    // -----------------------------------------------------------------------

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

    function _loadPatients() {
        if (ctrl.selectedSortCriteria === ctrl.SORT_BY_ROOM) {
            _loadPatientsByGroup(_buildIndexForPatientsByRoom, _buildPatientsByRoomDynamicItems);
        }
        else if (ctrl.selectedSortCriteria === ctrl.SORT_BY_PATIENT_NAME) {
            _loadPatientsByGroup(_buildIndexForPatientsByName, _buildPatientsByNameDynamicItems);
        }
    }

    /**
     * Load patients grouped by a given criteria (eg: by Room, by Name)
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

    function _buildIndexForPatientsByRoom() {
        // build index for the group
        ctrl.maxPatientsByRoom = 0;

        //The parameters for this request are set to get all the rooms with minimum number of patients because on
        // this point only the rooms and the total amount of patients are needed at this point
        var params = {
            companyid: companyId,
            patientunit: unit,
            hospservice: hospService,
            patientclass: PATIENT_CLASS_IN_PATIENT,
            offset: OFFSET_GET_ROOMS,
            orderby: 'patientroom',
            patientdetails: true,
            sortorder: ctrl.selectedSortDirection,
            limit: ROOM_COUNT_LIMIT,
            maxpatientsbyroom: ROOM_COUNT_MAX_PATIENTS_BY_ROOM
        };

        var paramsRoomsCapacities = {
            companyId: companyId,
            hospService: hospService,
            patientUnit: unit
        };

        return $q.all([dataServicePatients.getPatientsByRooms(params), dataServiceWhiteboard.getRoomCapacities(paramsRoomsCapacities)]).then(function (result) {
            var lastCount = 0;
            ctrl.indexGroups = [];

            var patientGroupsByRoom = result[0];
            var roomsCapacities = result[1];

            // no data
            if (_.isEmpty(patientGroupsByRoom)) {
                ctrl.hasData = false;
                ctrl.isLoaded = true;
            }
            else {
                _.forEach(patientGroupsByRoom, function (patientsGroup) {
                    // only add letters with patients
                    if (patientsGroup.nbPatients > 0) {
                        ctrl.hasData = true;

                        //Get capacity for the room
                        var capacity = undefined;
                        if (roomsCapacities) {
                            var roomCapacity = _.find(roomsCapacities, {roomnumber: patientsGroup.patientRoom});
                            if (roomCapacity) {
                                capacity = roomCapacity.nbbed;
                            }
                        }

                        // build index (patient groups)
                        ctrl.indexGroups.push({
                            value: patientsGroup.patientRoom,
                            count: patientsGroup.nbPatients,
                            offset: lastCount,
                            displayValue: patientsGroup.patientRoom,
                            capacity: capacity
                        });

                        lastCount += patientsGroup.nbPatients;

                        //Ensure the maximum number of patients by room match the real maximum number
                        if (patientsGroup.nbPatients > ctrl.maxPatientsByRoom) {
                            ctrl.maxPatientsByRoom = patientsGroup.nbPatients;
                        }
                    }
                });

                ctrl.hasData = true;
                ctrl.isLoaded = true;
            }

            return ctrl.indexGroups;
        });
    }

    /**
     * Creates object that handles pagination of patients filtered by 'patient room'
     * @param companyId
     * @param unit
     * @param hospService
     * @param patientClass
     * @param indexGroups
     * @private
     */
    function _buildPatientsByRoomDynamicItems(companyId, unit, hospService, patientClass, indexGroups) {

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
                orderby: 'patientroom',
                patientdetails: true,
                sortorder: ctrl.selectedSortDirection,
                limit: this.PAGE_SIZE,
                maxpatientsbyroom: ctrl.maxPatientsByRoom
            };

            dataServicePatients.getPatientsByRooms(params)
                .then(function (results) {
                    // key mapping to rename patient object properties
                    var keyMap = {
                        patientInfo: 'patient',
                        lastVisit: 'visit'
                    };

                    // 1. flatten data (list of patients) when creating the page...
                    var patients = [], page = [];
                    _.forEach(results, function(room) {
                        patients = patients.concat(room.patients);
                    });

                    // 2. ...and rename properties:
                    // - patientInfo => patient,
                    // - lastVisit => visit
                    _.forEach(patients, function(patient) {
                        patient = _.mapKeys(patient, function(value, key) {
                            return keyMap[key];
                        });
                        page.push(patient);
                    });

                    self.loadedPages[pageNumber] = page;
                    self.checkFirstGroupElementsInPage(pageNumber, page);

                    ctrl.spin = false;
                    ctrl.isScrolling = false;
                });
        }

        return new DynamicItems(companyId, unit, hospService, patientClass, indexGroups, fetchPage);
    }

    function _buildIndexForPatientsByName() {
        // build index for the group
        var options = {
            companyid: companyId,
            patientunit: unit,
            hospservice: hospService,
            patientclass: PATIENT_CLASS_IN_PATIENT,
            sortorder: ctrl.selectedSortDirection
        };

        return dataServicePatients.getPatientsCountByName(options)
            .then(function(patientGroupsByName) {
                var lastCount = 0;
                ctrl.indexGroups = [];

                // no data
                if(_.isEmpty(patientGroupsByName)) {
                    ctrl.hasData = false;
                    ctrl.isLoaded = true;
                }
                else {
                    if (ctrl.selectedSortDirection === 'desc') {
                        // reverse
                        patientGroupsByName.reverse();
                    }

                    _.forEach(patientGroupsByName, function (patientsGroup) {
                        // only add letters with patients
                        if (patientsGroup.count > 0) {
                            ctrl.hasData = true;

                            // build index (patient groups)
                            ctrl.indexGroups.push({
                                value: patientsGroup.lastName,
                                count: patientsGroup.count,
                                offset: lastCount,
                                displayValue: patientsGroup.lastName
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

export default RoomListHospExt;
