import template from './roomListHosp.component.html';

const RoomListHosp = {
    bindings: {
        openExtended: '&',
        params: '<'
    },
    controller: ['$rootScope', '$q', 'dataPager', 'dataservice.patients', 'dataservice.rooms', 'dataservice.whiteboard', 'logger', 'sessionService', controller],
    templateUrl: template
};

function controller($rootScope, $q, DataPager, dataServicePatients, dataServiceRooms, dataServiceWhiteboard, logger, session) {
    let unsubscribeCompanyChanged;
    let unsubscribeSelectedServiceChanged;
    let unsubscribeSelectedUnitChanged;

    var PATIENT_CLASS_IN_PATIENT = 'I';

    var FIRST_PATIENTS_PER_ROOM_LIMIT = 6;
    var DEFAULT_PATIENTS_PER_ROOM_LIMIT = 3;
    var DEFAULT_ROOM_LIMIT = 5;

    var companyId, hospService, unit;
    var ctrl = this;

    // Rooms
    ctrl.nbrRoom = 0;
    ctrl.nbrRoomMore = 0;
    ctrl.selectedRoomNumber = undefined;
    ctrl.defaultRoomLimit = DEFAULT_ROOM_LIMIT;
    ctrl.roomVMs = [];
    ctrl.isLoading = false;

    ctrl.$onInit = onInit;
    ctrl.$onDestroy = onDestroy;
    ctrl.allRoomsVisible = allRoomsVisible;
    ctrl.scrollToSelectedRoom = scrollToSelectedRoom;
    ctrl.showLessRooms = showLessRooms;
    ctrl.showMoreRooms = showMoreRooms;
    ctrl.showMorePatients = showMorePatients;
    ctrl.hasEntries = function () {
        return !_.isUndefined(ctrl.roomVMs) && !_.isUndefined(ctrl.roomVMs.length) && ctrl.roomVMs.length !== 0;
    };

    // ------------------------------------------------------------------------- Event handling

    function onInit() {
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

        _loadRooms();
    }

    function onDestroy() {
        if(unsubscribeCompanyChanged) {unsubscribeCompanyChanged();}
        if(unsubscribeSelectedServiceChanged) {unsubscribeSelectedServiceChanged();}
        if(unsubscribeSelectedUnitChanged) {unsubscribeSelectedUnitChanged();}
    }

    // ------------------------------------------------------------------------- Interface methods

    function allRoomsVisible() {
        return _.every(ctrl.roomVMs, _.iteratee('isVisible'));
    }

    function scrollToSelectedRoom(roomNumber) {
        // TODO: set selected room when opening in expanded mode
    }

    function showLessRooms() {
        ctrl.nbrRoom = ctrl.defaultRoomLimit;
        _showRooms();
    }

    function showMoreRooms() {
        ctrl.nbrRoom = ctrl.roomVMs.length;
        _showRooms();
        //_loadPatientsToLimit();
    }

    function showMorePatients(roomVM, resetSelectedRoom) {
        if (_.isUndefined(resetSelectedRoom)) {
            resetSelectedRoom = true;
        }

        // Reset selected room
        if (resetSelectedRoom) {
            ctrl.selectedRoomNumber = undefined;
        }

        roomVM
            .getNextPage()
            .catch(function (exception) {
                logger
                    .sendReport(exception, exception.message)
                    .then(function (index) {
                        ctrl.error = {
                            'message': exception.message,
                            'tryagain': true
                        };
                        if (index !== null && index !== undefined) {
                            ctrl.error.report = index;
                        }
                    });
            });
    }

    // -----------------------------------------------------------------------------------------------------------

    /**
     * Handle when company changes
     * @private
     */
    function _onCompanyChanged() {
        companyId = session.user.companyId;
        //It's not necessary load the rooms because the event for change service or unit will be fired
        //_loadRooms();
    }

    /**
     * Handle when service changes
     * @private
     */
    function _onServiceChanged() {
        hospService = ctrl.params.code;
        _loadRooms();
    }

    /**
     * Handle when unit changes
     * @private
     */
    function _onUnitChanged() {
        unit = ctrl.params.code;
        _loadRooms();
    }

    /**
     *
     * @returns {*}
     * @private
     */
    function _getFilterValue() {
        switch (ctrl.params.by) {
            case 'units':
                return { patientunit: (ctrl.params) ? ctrl.itemCode : undefined };

            case 'services':
                return { hospservice: (ctrl.params) ? ctrl.itemCode : undefined };
        }
    }

    /**
     *
     * @private
     */
    function _loadPatientsToLimit() {
        if (ctrl.roomVMs.length > 0) {
            _.each(ctrl.roomVMs, function (roomVM) {
                if ((roomVM.isVisible)) {
                    showMorePatients(roomVM, false);
                }
            });
        }
    }

    /**
     *
     * @private
     */
    function _loadRooms() {

        ctrl.isLoading = true;

        ctrl.itemCode = ctrl.params.code;
        var limit = DEFAULT_ROOM_LIMIT;
        var offset = 0;

        ctrl.roomVMs = [];
        ctrl.nbrRoom = DEFAULT_ROOM_LIMIT;
        ctrl.nbrRoomMore = 0;

        // Reset
        ctrl.error = undefined;
        ctrl.warning = undefined;

        // use new patient 'byrooms' endpoint to get rooms + patients
        var params = {
            companyid: companyId,
            patientunit: unit,
            hospservice: hospService,
            patientclass: PATIENT_CLASS_IN_PATIENT,
            maxpatientsbyroom: FIRST_PATIENTS_PER_ROOM_LIMIT,
            orderby: 'patientroom',
            sortorder: 'asc'
        };


        var paramsRoomsCapacities = {
            companyId: companyId,
            hospService: hospService,
            patientUnit: unit
        };

        $q.all([dataServicePatients.getPatientsByRooms(params), dataServiceWhiteboard.getRoomCapacities(paramsRoomsCapacities)])
            .then(function (result) {
                var patientsByRooms = result[0];

                var roomsCapacities = result[1];

                var pageSize = DEFAULT_PATIENTS_PER_ROOM_LIMIT;

                if (!_.isEmpty(patientsByRooms)) {

                    ctrl.roomVMs = patientsByRooms.map(function (room) {

                        //Get capacity for the room
                        if (roomsCapacities) {
                            var roomCapacity = _.find(roomsCapacities, {roomnumber: room.patientRoom});
                            if (roomCapacity) {
                                room.capacity = roomCapacity.nbbed;
                            }
                        }

                        var vm = new RoomViewModel(room, dataServicePatients, DataPager, pageSize, logger, session);
                        vm.getFilter = _getFilterValue;

                        // set initial load (patients) in all RoomViewModel's
                        var patientsByRoom = _getPatientsByRoom(patientsByRooms, room);

                        // set initial load (patients) only of fetched rooms (in patientsByRooms array)
                        if(patientsByRoom !== null) {
                            vm.setPatients(patientsByRoom.patients);
                        }

                        return vm;
                    });

                    if (!_.isEmpty(ctrl.roomVMs)) {
                        _showRooms();
                        // roomVMs already with initial load (patients)
                        //_loadPatientsToLimit();
                    } else {
                        ctrl.warning = {
                            'message': ctrl.errorNoRoom,
                            'tryagain': false
                        };
                    }
                }
                else {
                    ctrl.isLoading = false;
                }
            })
            .catch(function (exception) {
                //ctrl.isLoading = false;
                if (exception) {
                    logger
                        .sendReport(exception, exception.message)
                        .then(function (index) {
                            ctrl.error = {
                                'message': exception.message,
                                'tryagain': true
                            };
                            if (index !== null && index !== undefined) {
                                ctrl.error.report = index;
                            }
                        });
                }
            })
            .finally(function () {
                ctrl.isLoading = false;
            });
    }


    /**
     * Fetch list of rooms of a Unit or Service, each room having a (limited) list of patients.
     * @param roomList list of rooms: [{roomNumber: , nbPatients: }, {}, ..]
     * @returns {*} List of patients grouped by room number
     * @private
     */
    function _getPatientsByRooms(roomList) {
        // calculate total number of patients to request (based on the returned room list
        // and the limit to the max number of patients per room)
        var totalNumPatients = 0; // total number of patients
        var roomCount = 0;
        _.each(roomList, function(room) {
            totalNumPatients += (room.nbPatients <= DEFAULT_PATIENTS_PER_ROOM_LIMIT) ? room.nbPatients : DEFAULT_PATIENTS_PER_ROOM_LIMIT;

            // limit the count only to the first DEFAULT_ROOM_LIMIT rooms
            //if(++roomCount >= DEFAULT_ROOM_LIMIT) {
            //    return false;
            //}
        });

        // use new patient 'byrooms' endpoint to get rooms + patients
        var params = {
            companyid: companyId,
            hospservice: hospService,
            patientunit: unit,
            patientclass: PATIENT_CLASS_IN_PATIENT,
            limit: totalNumPatients,
            maxpatientsbyroom: DEFAULT_PATIENTS_PER_ROOM_LIMIT
        };
        return dataServicePatients.getPatientsByRooms(params);
    }

    /**
     * Get the list of patients in a given room
     * @param patientsByRooms list of rooms (rooms have patients)
     * @param room room
     * @returns {*}
     * @private
     */
    function _getPatientsByRoom(patientsByRooms, room) {
        var patients = null;
        _.each(patientsByRooms, function(patientsByRoom) {
            if(patientsByRoom.patientRoom === room.patientRoom) {
                patients = patientsByRoom;
                return false;
            }
        });

        return patients;
    }

    /**
     *
     * @private
     */
    function _showRooms() {
        if (ctrl.nbrRoom > ctrl.roomVMs.length) {
            ctrl.nbrRoom = ctrl.roomVMs.length;
        }
        for (var i = ctrl.roomVMs.length - 1; i >= 0; i--) {
            ctrl.roomVMs[i].isVisible = (i < ctrl.nbrRoom);
        }
        ctrl.nbrRoomMore = ctrl.roomVMs.length - ctrl.nbrRoom;
    }

    /**
     * View Model Class to group patients by room.
     * Handle the logic for displaying and paginating the list of patients
     * @param room
     * @param dataServicePatients
     * @param DataPager
     * @param pageSize
     * @param logger
     * @param session
     * @returns {RoomViewModel}
     * @constructor
     */
    function RoomViewModel(room, dataServicePatients, DataPager, pageSize, logger, session) {
        var vm = this;

        // Paging
        var dataPager = new DataPager();
        dataPager.pageSize = pageSize;
        dataPager.loadPage = loadPage;
        dataPager.sortBy = 'lastname';
        dataPager.sortDirection = 'asc';
        dataPager.setTotalItemsCount(room.nbPatients);

        vm.isVisible = false;
        vm.room = room;
        vm.isLoading = function () {
            return dataPager.isLoading;
        };
        vm.canGetNextPage = function () {
            return dataPager.canGetNextPage();
        };
        vm.getFilter = function () {
            return {};
        };
        vm.getNextPage = function () {
            return dataPager.getNextPage();
        };
        vm.roomList = dataPager.items;
        vm.getPatients = function () {
            return dataPager.items;
        };
        vm.setPatients = function(patients) {
            dataPager.setItems(patients);
            vm.roomList = dataPager.items;
        };

        return vm;

        // --------------------------------------------------------------------------- Data loading

        // Required by DataPager API
        /**
         * Fetch a new page (list) of patients
         * @param pageIndex
         * @param pageSize
         * @param sortBy
         * @param sortDirection
         */
        function loadPage(pageIndex, pageSize, sortBy, sortDirection) {
            var options = {
                companyid: session.user.companyId,
                patientroom: vm.room.patientRoom,
                offset: pageIndex * pageSize,
                limit: pageSize,
                orderby: sortBy,
                patientclass: PATIENT_CLASS_IN_PATIENT,
                sortorder: sortDirection
            };

            // Additional filter
            _.extend(options, vm.getFilter());

            return dataServicePatients
                .getPatientByRoomList(options)
                .then(function (result) {
                    var patientList = [];
                    // results.patients = Array: [{patient: , visit: }, {}, ...]
                    _.each(result.patients, function(patientByRoom) {
                        patientList.push(patientByRoom.patient);
                    });
                    return patientList;
                });
        }
    }
}

export default RoomListHosp;
