import angular from 'angular';
import _ from 'lodash';
import template from './whiteboard.component.html';

const Whiteboard = {
    controller: controller,
    templateUrl: template
};

controller.$inject = [
    '$animate',
    '$rootScope',
    '$filter',
    '$interval',
    '$state',
    '$stateParams',
    '$translate',
    '$transitions',
    'config',
    'sessionService',
    'waitForRendering',
    'whiteboardService',
    'whiteboardEditDialogService',
    'roomConfigurationService',
    'logger'
];

function controller(
    $animate,
    $rootScope,
    $filter,
    $interval,
    $state,
    $stateParams,
    $translate,
    $transitions,
    config,
    session,
    waitForRendering,
    whiteboardService,
    whiteboardEditDialogService,
    roomConfigurationService,
    logger
) {
    var ctrl = this;
    var autoRefreshHandler;
    var originState = 'whiteboard';
    var currentWhiteboardPosition;
    var previousCurrentWhiteboardPosition;
    var whiteboardDefaultSort = {};

    /* Set specific column width */
    var WIDTH_ROOM = 63;
    var WIDTH_ADMISSION = 85;
    var WIDTH_DISCHARGE = 80;
    var WIDTH_OPERATION = WIDTH_ADMISSION;

    var TIME_MILLIS_PER_DAY = 24 * 60 * 60 * 1000; // number of milliseconds in 1 day

    var COMPANY_ID_ANY = 5; // needed by business rule about rooms and beds
    var BED_SYMBOLS;

    ctrl.editMode = false; // track edit mode (to disable edit action)

    // Events
    ctrl.$onInit = onInit;
    ctrl.$onDestroy = onDestroy;

    // API
    ctrl.editItem = editItem;
    ctrl.goToState = goToState;
    ctrl.isTrue = isTrue;
    ctrl.isEmpty = isEmpty;
    ctrl.changeService = changeService;
    ctrl.getWhiteboardDate = getWhiteboardDate;
    ctrl.translate = translate;
    ctrl.getIsolationTypeText = getIsolationTypeText;
    ctrl.filterBy = filterBy;
    ctrl.filterByDate = filterByDate;
    ctrl.openConfigurationMenu = openConfigurationMenu;
    ctrl.editRoomConfiguration = editRoomConfiguration;
    ctrl.filterDate = null;
    ctrl.filterCriteria = null;
    ctrl.printingEnabled = null;

    // ------------------------------------------------

    function onInit() {

        // Register Refresh functions to the service
        whiteboardService.startAutoRefresh = startAutoRefresh;
        whiteboardService.stopAutoRefresh = stopAutoRefresh;

        ctrl.unsuscribeTransitionsOnStart = $transitions.onStart({}, function ($transition) {
            var statesTo = ['patient', 'visit.details', 'appointment.details'];
            if ($transition.$from().name === originState && _.includes(statesTo, $transition.$to().name)) {
                _readCurrentWhiteboardPosition();
                _setWhiteboardState();
            }
        });


        // Remove the animation from the whiteboard because of flickering
        waitForRendering.wait(function () {
            $animate.enabled(document.getElementsByClassName('dt-loaded')[0], false);
        });

        var isActive = whiteboardService.isActive();

        ctrl.doctorPrefix = $translate.instant('whiteboard.PHYSICIAN_PREFIX');
        ctrl.editLabel = $translate.instant('core.EDIT');

        ctrl.unsuscribeTranslateChange = $rootScope.$on('$translateChangeSuccess', function (event, current, previous) {
            ctrl.doctorPrefix = $translate.instant('whiteboard.PHYSICIAN_PREFIX');
            ctrl.editLabel = $translate.instant('core.EDIT');

            angular.element('.whiteboard-doctor-prefix').empty();
            angular.element('.whiteboard-doctor-prefix').append(ctrl.doctorPrefix);

            ctrl.dietsLang = whiteboardService.getLangFromUILanguage(current.language);

            _.forEach(ctrl.items, function (item) {
                _setDisplayLocation(item);
            });
        });

        // initial filter value and printing status
        ctrl.filterDate = "today"; // default = select 'today'
        ctrl.filterCriteria = "patients";
        ctrl.printingEnabled = true;

        // initialize bed symbols for company
        COMPANY_ID_ANY = config.whiteboard.symbolsBedsInRoom ? config.whiteboard.symbolsBedsInRoom.companyId : null;
        BED_SYMBOLS = config.whiteboard.symbolsBedsInRoom ? config.whiteboard.symbolsBedsInRoom : null;

        // tomorrow Whiteboard
        ctrl.isTomorrowWhiteboardEnabled = angular.isUndefined(config.whiteboard.tomorrowWhiteboardEnabled) ? true : config.whiteboard.tomorrowWhiteboardEnabled;

        // whiteboard configuration
        ctrl.isConfigurationEnabled = angular.isUndefined(config.whiteboard.configurationEnabled) ? false : config.whiteboard.configurationEnabled;

        // set whiteboard title from hospService route parameter
        ctrl.companyId = session.user.companyId;
        ctrl.isWhiteboardLoading = true;
        whiteboardService.getAvailableServices(ctrl.companyId).then(function (services) {
            ctrl.hospServices = services;
            ctrl.hospService = _.find(ctrl.hospServices, { code: $stateParams.hospService });
            ctrl.title = ctrl.hospService ? ctrl.hospService.codeDesc : '';

            ctrl.isWhiteboardLoading = false;
            // whiteboard not available for selected hospService
            if (!ctrl.hospService) {
                ctrl.isAvailable = false;
                return;
            }
            else {
                ctrl.isAvailable = isActive;
            }

            _applyWhiteboarStateValues();

            _getDietCatalog();

            // default = select 'today'
            ctrl.whiteboardDate = new Date();

            ctrl.params = {
                companyId: session.user.companyId,
                hospService: ctrl.hospService.code,
                occupancy: ctrl.filterCriteria,
                date: null // don't show patients already discharged today
            };

            ctrl.options = {
                rowHeight: 34,
                headerHeight: 34,
                footerHeight: false,
                rowClassesGetter: function (row) {
                    var item = ctrl.items[row.$$index];
                    if (item['highlighted']) {
                        return ({
                            "whiteboard-patient-operation": true
                        });
                    } else {
                        return {};
                    }
                },
                scrollbarV: true,
                selectable: false,
                sortType: 'single',
                columnMode: 'flex',
                columns: [
                    {
                        name: 'Room',
                        title: function () {
                            return ctrl.translate('whiteboard.HEADER_ROOM')
                        },
                        prop: 'roomValue',
                        sortBy: 'room',
                        frozenLeft: false,
                        canAutoResize: false,
                        resizable: false,
                        maxWidth: WIDTH_ROOM,
                        minWidth: WIDTH_ROOM,
                        width: WIDTH_ROOM,
                        sort: _getColumnSort('room'),
                        headerRenderer: function (scope, elem) {
                            return '<span class="fec-table-header">{{\'whiteboard.HEADER_SHORT_ROOM\' | translate}}</span>';
                        }
                    },
                    {
                        name: 'Patient',
                        title: function () {
                            return ctrl.translate('whiteboard.HEADER_PATIENT')
                        },
                        prop: 'patientNameValue',
                        sortBy: 'lastname',
                        frozenLeft: false,
                        minWidth: 180,
                        flexGrow: 2,
                        sort: _getColumnSort('lastname'),
                        headerRenderer: function (scope, elem) {
                            return '<span class="fec-table-header">{{\'whiteboard.HEADER_PATIENT\' | translate}}</span>';
                        },
                        cellRenderer: function (scope, elem) {
                            if (scope.$row.id) {
                                return '<a class="link" ui-sref="patient({pid: $row.patientId, originParams: {visitId: $row.visitId, appointmentId: $row.appointmentId}, originState: \'whiteboard\'})">' + whiteboardService.getPatientNamePrefix(scope.$row.sex) + ' ' + scope.$cell + '</a>';
                            } else {
                                return null;
                            }
                        }
                    },
                    {
                        name: 'AdmissionDate',
                        title: function () {
                            return ctrl.translate('whiteboard.HEADER_ADMISSION')
                        },
                        prop: 'admitDateValue',
                        canAutoResize: false,
                        resizable: false,
                        maxWidth: WIDTH_ADMISSION,
                        minWidth: WIDTH_ADMISSION,
                        width: WIDTH_ADMISSION,
                        sortBy: 'admitDateMillis',
                        sort: _getColumnSort('admitDateMillis'),
                        headerRenderer: function (scope, elem) {
                            return '<span class="fec-table-header">{{\'whiteboard.HEADER_SHORT_ADMISSION\' | translate}}</span>';
                        },
                        cellRenderer: function (scope, elem) {
                            if (scope.$row.id) {
                                return '<a class="link" ui-sref="visit.details({vnb: $row.visitId, originParams: {visitId: $row.visitId, appointmentId: $row.appointmentId}, originState: \'whiteboard\'})">' + scope.$cell + '</a>';
                            }
                        }
                    },
                    {
                        name: 'Insurance',
                        title: function () {
                            return ctrl.translate('whiteboard.HEADER_INSURANCE_TITLE')
                        },
                        prop: 'insuranceValue',
                        sortable: false,
                        resizable: false,
                        minWidth: 40,
                        headerClassName: 'centered',
                        className: 'centered',
                        headerRenderer: function (scope, elem) {
                            return '<span class="fec-table-header">{{\'whiteboard.HEADER_INSURANCE\' | translate}}</span>';
                        }
                    },
                    {
                        name: 'DischargeDate',
                        title: function () {
                            return ctrl.translate('whiteboard.HEADER_DISCHARGE')
                        },
                        prop: 'dischargeDateValue',
                        sortBy: 'dischargeDateMillis',
                        sort: _getColumnSort('dischargeDateMillis'),
                        canAutoResize: false,
                        resizable: false,
                        maxWidth: WIDTH_DISCHARGE,
                        minWidth: WIDTH_DISCHARGE,
                        width: WIDTH_DISCHARGE,
                        headerRenderer: function (scope, elem) {
                            return '<span class="fec-table-header">{{\'whiteboard.HEADER_SHORT_DISCHARGE\' | translate}}</span>';
                        }
                    },
                    {
                        name: 'Physician',
                        title: function () {
                            return ctrl.translate('whiteboard.HEADER_PHYSICIAN')
                        },
                        prop: 'physician',
                        sortable: false,
                        flexGrow: 1.5,
                        headerRenderer: function (scope, elem) {
                            return '<span class="fec-table-header">{{\'whiteboard.HEADER_PHYSICIAN\' | translate}}</span>';
                        },
                        cellRenderer: function (scope, elem) {
                            if (scope.$row.id) {
                                if (scope.$row.editedPhysician && scope.$row.editedPhysician.length > 0) {
                                    elem.append(_generatePhysiciansContent(scope.$row.editedPhysician));
                                    //avoid the creation of the cell scope and the execution of $compile
                                    return null;
                                } else if (scope.$row.physician && scope.$row.physician.length > 0) {
                                    elem.append(_generatePhysiciansContent(scope.$row.physician));
                                    //avoid the creation of the cell scope and the execution of $compile
                                    return null;
                                } else {
                                    elem.append('<span>-</span>');
                                    //avoid the creation of the cell scope and the execution of $compile
                                    return null;
                                }
                            }
                        }
                    },
                    {
                        name: 'Nurse',
                        title: function () {
                            return ctrl.translate('whiteboard.HEADER_NURSE')
                        },
                        prop: 'nurseNameValue',
                        sortBy: 'nurseName',
                        sort: _getColumnSort('nurseName'),
                        flexGrow: 1.5,
                        headerRenderer: function (scope, elem) {
                            return '<span class="fec-table-header">{{\'whiteboard.HEADER_NURSE\' | translate}}</span>';
                        },
                        cellRenderer: function (scope, elem) {
                            if (scope.$row.id) {
                                return '<fec-whiteboard-inline-nurse-edit item="$row">' +
                                    '</fec-whiteboard-inline-nurse-edit>';
                            }
                        }
                    },
                    {
                        name: 'Diet',
                        title: function () {
                            return ctrl.translate('whiteboard.HEADER_DIET')
                        },
                        prop: 'diet',
                        sortable: false,
                        resizable: false,
                        canAutoResize: false,
                        minWidth: 60,
                        maxWidth: 60,
                        width: 60,
                        headerClassName: 'centered',
                        className: 'centered whiteboard-table-icon',
                        headerRenderer: function (scope, elem) {
                            return '<span class="fec-table-header">{{\'whiteboard.HEADER_DIET\' | translate}}</span>';
                        },
                        cellRenderer: function (scope, elem) {
                            if (scope.$row.id) {
                                return '<fec-whiteboard-diet-tooltip ' +
                                    'company-id ="$ctrl.companyId" ' +
                                    'hosp-service="$ctrl.hospService" ' +
                                    'diet="$row.diet" ' +
                                    'diets-catalog="$ctrl.dietsCatalog"' +
                                    'lang="$ctrl.dietsLang">' +
                                    '</fec-whiteboard-diet-tooltip>';
                            }
                        }
                    },
                    {
                        name: 'Isolation',
                        title: function () {
                            return ctrl.translate('whiteboard.HEADER_ISOLATION_TITLE')
                        },
                        prop: 'isolationTypeValue',
                        sortable: false,
                        resizable: false,
                        minWidth: 60,
                        headerClassName: 'centered',
                        className: 'centered',
                        headerRenderer: function (scope, elem) {
                            return '<span class="fec-table-header">{{\'whiteboard.HEADER_ISOLATION\' | translate}}</span>';
                        }
                    },
                    {
                        name: 'OperationDate',
                        title: function () {
                            return ctrl.translate('whiteboard.HEADER_OPERATION')
                        },
                        prop: 'operationDateValue',
                        sortBy: 'operationDateMillis',
                        sort: _getColumnSort('operationDateMillis'),
                        canAutoResize: false,
                        resizable: false,
                        maxWidth: WIDTH_OPERATION,
                        minWidth: WIDTH_OPERATION,
                        width: WIDTH_OPERATION,
                        headerRenderer: function (scope, elem) {
                            return '<span class="fec-table-header">{{\'whiteboard.HEADER_SHORT_OPERATION\' | translate}}</span>';
                        },
                        cellRenderer: function (scope, elem) {
                            if (scope.$row.id) {
                                if (scope.$row.appointmentId && !scope.$row.editedOperationDate) {
                                    return '<span class="link" ui-sref="appointment.details({aid: $row.appointmentId, originParams: {visitId: $row.visitId, appointmentId: $row.appointmentId}, originState: \'whiteboard\'})">' + scope.$cell + '</span>';
                                } else {
                                    elem.append('<span>' + scope.$cell + '</span>');
                                    //avoid the creation of the cell scope and the execution of $compile
                                    return null;
                                }
                            }
                        }
                    },
                    /*
                    {   name: 'Reason',
                        title: function() {
                            return ctrl.translate('whiteboard.HEADER_REASON')
                        },
                        prop: 'reason', sortable: false, flexGrow: 3,
                        headerRenderer: function(scope, elem) {
                            return '<span>{{\'whiteboard.HEADER_REASON\' | translate}}</span>'
                        }
                    },
                    {   name: 'Notes',
                        title: function() {
                            return ctrl.translate('whiteboard.HEADER_NOTES')
                        },
                        prop: 'comment', sortable: false, flexGrow: 2,
                        headerRenderer: function(scope, elem) {
                            return '<span>{{\'whiteboard.HEADER_NOTES\' | translate}}</span>'
                        }
                    },
                    */
                    {
                        name: '',
                        minWidth: 30,
                        sortable: false,
                        className: 'whiteboard-table-icon',
                        cellRenderer: function (scope, elem) {
                            // check if it's editable
                            if (scope.$row.id) {
                                return '<div class="action-column" ng-class="{\'disabled\': $ctrl.editMode}" layout layout-align="end center"><span class="link" fec-mobile-click="!$ctrl.editMode && $ctrl.editItem($row)"><md-tooltip md-direction="top">{{$ctrl.editLabel}}</md-tooltip>\n<fec-icon type="edit" size="xs" color="fe-blue-icon"></fec-icon></span></div>';
                            }
                        }
                    }
                ]
            };

            if (ctrl.isAvailable) {
                // load data...
                _getAllRoomTypes(ctrl.companyId, ctrl.hospService.code)
                    .then(function (roomTypes) {
                        // set list with room types (used to format the display of room + bed)
                        ctrl.roomTypes = roomTypes;

                        // refresh whiteboard
                        _refresh();
                    });

                // ...and start Auto-refresh
                startAutoRefresh();

                // and subscribe to pending request(s) to lock whiteboard item(s)
                whiteboardEditDialogService.onPendingLockAcquiredChanged.subscribe(leaveEditMode);

                // room configuration (to set location display value)
                ctrl.isRoomConfigurationAvailable = false;
                ctrl.roomConfiguration = null;
                roomConfigurationService.isdAvailable(ctrl.companyId, ctrl.hospService.code)
                    .then(function (isAvailable) {
                        ctrl.isRoomConfigurationAvailable = isAvailable;
                        if (isAvailable) {
                            roomConfigurationService.getRoomConfiguration(ctrl.companyId, ctrl.hospService.code)
                                .then(function (roomConfiguration) {
                                    ctrl.roomConfiguration = roomConfiguration;
                                });
                        }
                    })
            }
        });
    }

    function onDestroy() {
        // stop Auto-refresh
        stopAutoRefresh();

        if (!_.isUndefined(ctrl.unsuscribeTranslateChange)) {
            ctrl.unsuscribeTranslateChange();
        }

        // and unsubscribe to pending lock message
        whiteboardEditDialogService.onPendingLockAcquiredChanged.unsubscribe(leaveEditMode);

        if (!_.isUndefined(ctrl.unsuscribeTransitionsOnStart)) {
            ctrl.unsuscribeTransitionsOnStart();
        }
    }

    // ------------------------------------------------ API methods

    function filterBy(filterCriteria) {
        ctrl.filterCriteria = filterCriteria;
        ctrl.params.occupancy = filterCriteria;
        _refresh();
    }

    function filterByDate(filterDate) {
        ctrl.filterDate = filterDate;
        switch (filterDate) {
            case 'tomorrow':
                var tomorrowTime = new Date().getTime() + TIME_MILLIS_PER_DAY;
                ctrl.params.date = new Date(tomorrowTime).toISOString().slice(0, 10);
                // update whiteboard date
                ctrl.whiteboardDate = new Date(ctrl.params.date);
                break;

            case 'today':
            default:
                var todayDate = new Date().toISOString().slice(0, 10);
                ctrl.params.date = null;
                // update whiteboard date
                ctrl.whiteboardDate = new Date(todayDate);
                break;
        }
        _refresh();
    }

    function changeService() {
        $state.go('whiteboard', {
            companyId: ctrl.companyId,
            hospService: ctrl.hospService.code
        });
    }

    function isEmpty(value) {
        // check for null or "" => true; otherwise, false
        return !value || (_.isString(value) && value.length === 0);
    }

    function editItem($row) {
        $rootScope.$broadcast(whiteboardService.EVENT_LEAVE_NURSE_EDIT_MODE, {});
        editWhiteboardItem($row, ctrl.params);
    }

    function openConfigurationMenu($mdMenu, $event) {
        $mdMenu.open($event);
    }

    function editRoomConfiguration() {
        roomConfigurationService.edit(ctrl.companyId, ctrl.hospService)
            .then(function (roomConfiguration) {
                if (roomConfiguration) {
                    // update
                    roomConfigurationService.update(ctrl.companyId, ctrl.hospService.code, roomConfiguration)
                        .then(function (updatedRoomConfiguration) {
                            ctrl.roomConfiguration = updatedRoomConfiguration;
                            //Refresh the view with the new data
                            _refresh();

                            // show notification - success
                            logger.success($translate.instant('whiteboard.SUCCESS_ON_ACTION_SAVE'), false);
                        })
                        .catch(function (error) {
                            // show notification - error
                        });
                }
            })
            .catch(function (error) {
                console.log('error:', error);
            })
    }

    function goToState(state, params) {
        // $state.go(state, params);
        var url = $state.href(state, params, { absolute: true, inherit: true });
        url = url.replace(/^#.*?/, ""); // remove #
        url = url + '?companyid=' + session.user.companyId + '&hospservice=' + ctrl.hospService.code + '&originstate=' + originState;
        window.location = url;
    }

    function leaveEditMode() {
        ctrl.editMode = false;
    }

    function editWhiteboardItem(item, params) {
        // enable edit mode
        ctrl.editMode = true;

        // stop auto-refresh...
        stopAutoRefresh();

        // open edit dialog, and handle getting the lock in the service
        //  on returning, handle unlocking (if necessary)
        whiteboardEditDialogService.editItem(item)
            .then(function (result) {
                var editedItem = result.editedItem;
                var lockAcquired = result.lockAcquired;
                var pendingLockRequest = result.pendingLockRequest;

                var copyEditedItem;
                // Save
                if (editedItem) {
                    //update values for the item in the table
                    item.diet = editedItem.diet;

                    // create copy before updating (problem with serialization/deserialization with physician type: string, array)
                    copyEditedItem = angular.copy(editedItem);

                    //remove properties added only for the table view
                    delete copyEditedItem.dischargeDateMillis;
                    delete copyEditedItem.admitDateMillis;
                    delete copyEditedItem.operationDateMillis;
                    delete copyEditedItem.insuranceValue;
                    delete copyEditedItem.patienNameValue;
                    delete copyEditedItem.dischargeDateValue;
                    delete copyEditedItem.operationDateValue;
                    delete copyEditedItem.admitDateValue;
                    delete copyEditedItem.isolationTypeValue;
                    delete copyEditedItem.nurseNameValue;
                    delete copyEditedItem.patientNameValue;
                    delete copyEditedItem._patientLocation;

                    whiteboardService.updateWhiteboardItem(copyEditedItem, params)
                        .then(function (updatedItem) {
                            editedItem.physician = updatedItem.physician;
                            editedItem.editedPhysician = updatedItem.editedPhysician;

                            logger.success($translate.instant('whiteboard.SUCCESS_ON_ACTION_SAVE'), false);

                            // release lock
                            if (lockAcquired) {
                                whiteboardService.unlockWhiteboardItem(item.id)
                                    .finally(function () {
                                        ctrl.editMode = false;
                                    });
                            }
                            else {
                                ctrl.editMode = false;
                            }

                            //Refresh the view with the new data
                            _refresh();
                        });
                }
                // Cancel
                else {
                    // release lock
                    if (lockAcquired) {
                        whiteboardService.unlockWhiteboardItem(item.id)
                            .finally(function () {
                                ctrl.editMode = false;
                            });
                    }
                    else {
                        if (!pendingLockRequest) {
                            ctrl.editMode = false;
                        }
                    }
                }
            })
            .catch(function () {
                // explicitly declare catch (1.6+)
                ctrl.editMode = false;
            })
            .finally(function () {
                // re-start Auto-refresh
                startAutoRefresh();
            });

    }

    function isTrue(value) {
        return value ? $filter('translate')('core.YES') : '-';
    }

    function getIsolationTypeText(isolationType) {
        return whiteboardService.getIsolationTypeText(isolationType);
    }

    function getWhiteboardDate() {
        return $filter('formatDate')(ctrl.whiteboardDate, 'language');
    }

    function startAutoRefresh() {
        if (config.whiteboard && config.whiteboard.autoRefreshInterval) {
            autoRefreshHandler = $interval(_refresh, config.whiteboard.autoRefreshInterval * 1000);
        }
    }

    function stopAutoRefresh() {
        if (!_.isUndefined(autoRefreshHandler)) {
            $interval.cancel(autoRefreshHandler);
            autoRefreshHandler = undefined;
        }
    }

    // TODO: add translations
    function _getPatientBed(room, bed, language) {
        // TODO: make it more "pluggable"
        // apply business rules

        // check "room type" AND "category"

        /*
        // room types:
        // 1BED, ORN   -> room
        // 1BJS, ORN   -> room
        // 2BED, RNDW  -> room + '.' + P|F (now with translation)
        // AMB,  RN16  -> room + '.' + 1...6
        // OTH,  RNDW  -> room + '.' + P|F (now with translation)
        // MED,  RWBN  -> room
        // LOUN, RWBN  -> room
        // MBS,  RWBN  -> room
        // PRS,  RWBN  -> room

        // categories:
        // ORN  - Only Room Number
        // RNDW - Room Number DW (P/F mappings, no mapping)
        // RN16 - Room Number 1..6
        // RWBN - Room Without Bed Number

        var value;
        var room;
        var bed;
        var type;

        if(type === 'ORN' || type === 'RWBN') {
            value = room;
        }
        else if(type === 'RNDW') {
            value = room + '.' + _getPatientBed(room, bed);
        }
        else {
            value = room + '.' + bed;
        }

        */

        var lang = language ? language : 'EN';

        if (ctrl.companyId === COMPANY_ID_ANY && BED_SYMBOLS) {
            if (_.findIndex(BED_SYMBOLS.roomExceptions, room) < 0) {
                // bed by door
                if (bed === BED_SYMBOLS.byDoor.number) {
                    return $translate.instant('whiteboard.' + BED_SYMBOLS.byDoor.symbol);
                }
                // bed by window
                if (bed === BED_SYMBOLS.byWindow.number) {
                    return $translate.instant('whiteboard.' + BED_SYMBOLS.byWindow.symbol);
                }
            }
        }

        // default value
        return bed;
    }

    function translate(code) {
        return $filter('translate')(code);
    }

    // ------------------------------------------------ Helper methods

    /**
     * Return the sort (asc/desc) for the given column
     * @param sortBy
     * @returns {string}
     * @private
     */
    function _getColumnSort(sortBy) {
        if (whiteboardDefaultSort.sortBy) {
            return sortBy === whiteboardDefaultSort.sortBy ? whiteboardDefaultSort.sort : undefined;
        } else {
            return sortBy === 'room' ? 'asc' : undefined;
        }
    }

    /**
     * Generetes the spans for every physician and ads translations
     * @param physicians
     * @returns {string}
     * @private
     */
    function _generatePhysiciansContent(physicians) {
        var content = '';

        _.forEach(physicians, function (physician, index) {
            content = content + '<span><span class="whiteboard-doctor-prefix">' + ctrl.doctorPrefix + '</span>' + '&nbsp;' + $filter('uppercase')(physician);
            if (index < (physicians.length - 1)) {
                content = content + '<span>,&nbsp;</span>';
            }
            content = content + '</span>';
        });

        return content;
    }

    /**
     * Concats the room and the bed
     * @param roomObject
     * @returns {*}
     * @private
     */
    function _setDisplayLocation(roomObject) {
        var CATEGORY_ONLY_ROOM_NUMBER = 'ORN';
        var CATEGORY_ROOM_WITHOUT_ROOM_NUMBER = 'RWBN';
        var CATEGORY_ROOM_NUMBER_DOOR_WINDOW = 'RNDW';
        var CATEGORY_ROOM_NUMBER_1_TO_6 = 'RN16';

        var room = roomObject.room;
        var bed = roomObject.patientBed;
        var roomCategory = _findRoomCategory(room);
        var displayLocation = room;

        switch (roomCategory) {
            case CATEGORY_ONLY_ROOM_NUMBER:
            case CATEGORY_ROOM_WITHOUT_ROOM_NUMBER:
                displayLocation = room;
                break;
            case CATEGORY_ROOM_NUMBER_DOOR_WINDOW:
                displayLocation = room + (ctrl.isEmpty(bed) ? '' : ('.' + _getPatientBed(room, bed)));
                break;
            case CATEGORY_ROOM_NUMBER_1_TO_6:
                displayLocation = room + (ctrl.isEmpty(bed) ? '' : ('.' + bed));
                break;
            default:
                // fallback (eg roomType == null)
                displayLocation = room + (ctrl.isEmpty(bed) ? '' : ('.' + _getPatientBed(room, bed)));
        }

        roomObject.roomValue = displayLocation;
        roomObject.displayLocation = displayLocation;
        return roomObject;
    }

    function _setRoomValue(roomObject) {
        var location = '';
        if (roomObject.patientBedSymbol === 'P') {
            location = $translate.instant('whiteboard.LOCATION_DOOR');
        }
        if (roomObject.patientBedSymbol === 'F') {
            location = $translate.instant('whiteboard.LOCATION_WINDOW');
        }

        var roomValue = roomObject.room + (ctrl.isEmpty(roomObject.patientBed) ? '' : '.') + location;
        roomObject.roomValue = roomValue;

        return roomObject;
    }

    /**
     * Find the category of a room by looking at room configuration and room types
     */
    function _findRoomCategory(room) {
        if (ctrl.roomConfiguration && ctrl.roomTypes) {
            // find room configuration for room
            var roomConfig = ctrl.roomConfiguration.find(function (roomConfig) {
                return roomConfig.room === room && roomConfig.roomType;
            });

            if (roomConfig) {
                // find room type for room
                var roomType = ctrl.roomTypes.find(function (roomType) {
                    return roomConfig.roomType === roomType.code;
                });

                if (roomType) {
                    // return room category
                    return roomType.category;
                }
            }
        }
    }

    /**
     * Load all room types.
     * The room types are used to format the display of room + bed, so we can limit and get only with english translations
     * @param {*} companyId
     * @param {*} serviceCode
     */
    function _getAllRoomTypes(companyId, serviceCode) {
        return whiteboardService.getRoomTypes({
            companyId: companyId,
            serviceCode: serviceCode,
            lang: 'en'
        });
    }

    /**
     * Creates the value for the cell for the patient, concatenates name and birth year
     * @param roomObject
     * @returns {*}
     * @private
     */
    function _setPatientNameValue(roomObject) {

        var patientNameValue = null;

        if (roomObject.lastname) {
            patientNameValue = roomObject.lastname.toUpperCase() + ' (' + $filter('formatDate')(roomObject.birthDate, 'year') + ')';
        } else {
            patientNameValue = '-';
        }

        roomObject.patientNameValue = patientNameValue;

        return roomObject;
    }

    function _getDtBodyItem() {
        var dtBodyItems = document.getElementsByClassName("dt-body");
        return dtBodyItems ? dtBodyItems.item(0) : null;
    }

    function _setCurrentWhiteboardPosition() {
        if (currentWhiteboardPosition || previousCurrentWhiteboardPosition) {
            waitForRendering.wait(function () {
                var dtBodyItem = _getDtBodyItem();

                if (dtBodyItem) {
                    if (previousCurrentWhiteboardPosition) {
                        dtBodyItem.scrollTop = previousCurrentWhiteboardPosition;
                        currentWhiteboardPosition = previousCurrentWhiteboardPosition;
                        //set as undefined after use it, return to normal behaviour
                        previousCurrentWhiteboardPosition = undefined;
                    } else {
                        dtBodyItem.scrollTop = currentWhiteboardPosition;
                    }
                }
            });
        }
    }

    function _readCurrentWhiteboardPosition() {
        var dtBodyItem = _getDtBodyItem();
        if (dtBodyItem) {
            currentWhiteboardPosition = dtBodyItem.scrollTop;
        }
    }

    // MW will now return the whiteboard with/without empty rooms
    // Simplified _refresh
    function _refresh() {
        ctrl.params.filterCriteria = ctrl.filterCriteria;
        whiteboardService.getWhiteboard(ctrl.params)
            .then(function (items) {
                _readCurrentWhiteboardPosition();
                ctrl.items = items;

                _.forEach(ctrl.items, function (item) {
                    if (item.id) {
                        //Operation Date adaptations
                        // Ensure we're getting the right date or null as a fallback
                        var operationDate = item.editedOperationDate ? item.editedOperationDate : item.operationDate;

                        //Set format value for operation date
                        item.operationDateValue = (operationDate ? $filter('formatDate')(operationDate, 'dateTimeDDMMHH') + 'h' : '-');

                        //Set highlighted if needed
                        item.highlighted = (config.whiteboard.highlightOperationToday && operationDate && $filter('formatDate')(ctrl.whiteboardDate, 'date') === $filter('formatDate')(operationDate, 'date'));

                        //Add Millis for operation date to the object
                        item.operationDateMillis = operationDate ? operationDate.getTime() : null;

                        //Add Millis for admit date
                        item.admitDateMillis = item.admitDate ? item.admitDate.getTime() : null;

                        // Discharge Date adaptations
                        // Ensure we're getting the right date or null as a fallback
                        var dischargeDate = item.editedDischargeDate ? item.editedDischargeDate : item.dischargeDate;

                        //Set format value for Discharge date
                        item.dischargeDateValue = (dischargeDate ? $filter('formatDate')(dischargeDate, 'dateYY') : '-');

                        //Set format for admit date
                        item.admitDateValue = (item.admitDate ? $filter('formatDate')(item.admitDate, 'dateTimeDDMMHH') + 'h' : '-');

                        //Add Millis for discharge Date
                        item.dischargeDateMillis = dischargeDate ? dischargeDate.getTime() : null;

                        //set value for isolation, null is '-'
                        item.isolationTypeValue = item.isolationType ? item.isolationType : '-';

                        //set value for insurance, null is '-'
                        item.insuranceValue = item.insurance ? item.insurance : '-';

                        //set value for nurses, null is '-'
                        item.nurseNameValue = item.nurseName ? item.nurseName : '-';

                        _setPatientNameValue(item);
                    }
                    // new property with bed symbol added to model
                    // TODO: new property leaks to MW
                    item.patientBedSymbol = _getPatientBed(item.room, item.patientBed);
                    item._patientLocation = item.room + '.' + item.patientBed;

                    _setDisplayLocation(item);
                });

                // Use numerical _patientLocation (with numerical values - eg: "418.1") to sort array
                // 'P' (=1) should be displayed before 'F' (=2)
                ctrl.items = ctrl.items.sort(function (a, b) { if (a._patientLocation > b._patientLocation) return 1; if (a._patientLocation < b._patientLocation) return -1; return 0; });

                _setCurrentWhiteboardPosition();

                _setWhiteboardState();
            });
    }

    /**
     * Gets the current diet catalog in all languages
     */
    function _getDietCatalog() {
        ctrl.dietsCatalog = [];
        ctrl.dietsLang = whiteboardService.getLangFromUILanguage(session.getUILanguage());

        whiteboardService.getDietCatalog({
            companyId: ctrl.companyId,
            hospService: ctrl.hospService.code
        })
            .then(function (dietsCatalog) {
                ctrl.dietsCatalog = dietsCatalog;
            })
            .catch(function () {
                console.error('No diet values available');
            });
    }

    function _setWhiteboardState() {
        var currentColumn = {};
        _.each(ctrl.options.columns, (column) => {
            if (column.sort && column.sort != undefined) {
                currentColumn = _.pick(column, ['sortBy', 'sort']);
            }
        });
        whiteboardService.setWhiteboardState({
            companyId: session.user.companyId,
            hospService: ctrl.hospService.code,
            filterCriteria: ctrl.filterCriteria,
            filterDate: ctrl.filterDate,
            currentWhiteboardPosition: currentWhiteboardPosition,
            sortBy: currentColumn.sortBy,
            sort: currentColumn.sort
        });
    }

    function _applyWhiteboarStateValues() {
        var whiteboardState = whiteboardService.getWhiteboardState();
        if (whiteboardState) {
            if (whiteboardState.filterCriteria) {
                ctrl.filterCriteria = whiteboardState.filterCriteria;
            }
            if (whiteboardState.filterDate) {
                ctrl.filterDate = whiteboardState.filterDate;
            }
            if (whiteboardState.currentWhiteboardPosition) {
                //Set to previous value for set the correct scroll position after first refresh
                previousCurrentWhiteboardPosition = whiteboardState.currentWhiteboardPosition;
            }
            if (whiteboardState.sortBy && whiteboardState.sort) {
                whiteboardDefaultSort = {
                    sortBy: whiteboardState.sortBy,
                    sort: whiteboardState.sort
                };
            }
        }
    }

}

export default Whiteboard;
