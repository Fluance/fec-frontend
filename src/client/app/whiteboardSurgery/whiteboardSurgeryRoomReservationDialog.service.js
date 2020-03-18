import angular from 'angular';
import _ from 'lodash';
import * as moment from 'moment';
import template from './whiteboardSurgeryRoomReservationDialog.tmpl.html';

/* @ngInject */
whiteboardSurgeryRoomReservationDialogService.$inject = ['$mdDialog', 'config'];

function whiteboardSurgeryRoomReservationDialogService($mdDialog, config) {

    const ACTION_ADD_RESERVATION = 'add';
    const ACTION_UPDATE_RESERVATION = 'update';
    const ACTION_DELETE_RESERVATION = 'delete';

    const FORM_VALIDITY_DATE_OVERLAP = 'dateOverlap';
    const FORM_VALIDITY_DATE_ORDER = 'dateOrder'

    let availableRooms;
    var actionType;

    // lock management
    let lockAcquired = false; // was able to lock resource
    let canceled = false; // indicate that a locked resource should be unlocked (eg: user clicked outside of dialog area and cancelled operation)
    let waitingForLock = true; // async call to lock resource hasn't completed

    onInit();

    var service = {
        ACTION_ADD_RESERVATION,
        ACTION_UPDATE_RESERVATION,
        ACTION_DELETE_RESERVATION,

        addRoomReservation: addRoomReservation,
        editRoomReservation: editRoomReservation
    };

    return service;

    // ------------------------------------------------------------ initialization

    function onInit() {
        _setAvailableRooms(config.whiteboardSurgery.operationRooms); // All available rooms according to the config
    }

    // ------------------------------------------------------------ Public API

    function addRoomReservation({companyId, roomName, selectedDate}) {
        actionType = ACTION_ADD_RESERVATION;
        return _openRoomReservation({companyId, roomName, selectedDate})
        .then(function ({actionType, reservation}) {
            // action: cancel, save
            return {
                actionType,
                reservation
            };
        }).catch(function () {
            // click outside
            return false;
        });
    }

    function editRoomReservation({companyId, reservation, roomName}) {
        actionType = ACTION_UPDATE_RESERVATION;

        return _openRoomReservation({companyId, reservation, roomName})
        .then(function ({actionType, reservation}) {
            // action: cancel, save
            return {
                actionType,
                reservation,
                lockAcquired
            };
        }).catch(function () {
            // click outside
            canceled = true;
            return {
                lockAcquired
            };
        });
    }

    // ------------------------------------------------------------

    function _setAvailableRooms(rooms) {
        availableRooms = rooms;
    }

    function _getLocationNames(companyId) {
        return availableRooms[companyId];
    }

    function _openRoomReservation({companyId, reservation, roomName, selectedDate}) {
        const isNewReservation = _.isNil(reservation);

        return $mdDialog.show({
            templateUrl: template,
            controller: ['$mdDialog', '$scope', 'whiteboardSurgeryService', DialogController],
            controllerAs: '$ctrl',
            locals: {
                companyId: companyId,
                roomReservation: angular.copy(reservation),
                rooms: _getLocationNames(companyId),
                selectedRoom: roomName,
                disableRoomSelection: roomName ? true : false,
                newReservation: isNewReservation
            },
            bindToController: true,
            clickOutsideToClose: true,
            escapeToClose: true
        });

        function DialogController($mdDialog, $scope, whiteboardSurgeryService) {
            const ctrl = this;
            const selectedReservationDate = selectedDate ? moment(selectedDate) : moment();
            const beginDate = selectedReservationDate.toDate();
            const endDate = selectedReservationDate.toDate();

            ctrl.isLocked = false;
            ctrl.waitingForLock = !isNewReservation;
            ctrl.minDate = selectedReservationDate.format('DD-MM-YYYY');
            //ctrl.startDateMinDate = now.format('DD-MM-YYYY');
            //ctrl.endDateMinDate = now.format('DD-MM-YYYY');

            // Public API
            ctrl.cancel = cancel;
            ctrl.saveReservation = saveReservation;
            ctrl.deleteReservation = deleteReservation;

            // Events
            ctrl.$onInit = onInit;

            // ----------------------------------------------------------- Events

            function onInit() {
                _initializeReservation(companyId, isNewReservation);

                ctrl.deregisterBeginDateWatch = $scope.$watch('$ctrl.reservation.beginDate', function(newVal, oldVal) {
                    _onChangedBeginDate();
                });

                ctrl.deregisterEndDateWatch = $scope.$watch('$ctrl.reservation.endDate', function(newVal, oldVal) {
                    _onChangedEndDate();
                });

                ctrl.deregisterEndDateWatch = $scope.$watch('$ctrl.reservation.room', function(newVal, oldVal) {
                    _onChangedRoom();
                });

                // try to get lock before editing reservation...
                if (!isNewReservation) {
                    whiteboardSurgeryService.lockRoomReservation(reservation.id)
                    .then(function () {
                        lockAcquired = true;
                    })
                    .catch(function () {
                        lockAcquired = false
                    })
                    .finally(function() {
                        // unlock a canceled lock request
                        if(waitingForLock && lockAcquired && canceled) {
                            whiteboardSurgeryService.unlockRoomReservation(reservation.id);
                        }
                        else {
                            ctrl.isLocked = !lockAcquired;
                            waitingForLock = false;
                            ctrl.waitingForLock = waitingForLock;
                        }
                    });
                }
            }

            // ----------------------------------------------------------- Public API

            function saveReservation() {
                _closeDialog(ctrl.reservation);
            }

            function deleteReservation() {
                actionType = ACTION_DELETE_RESERVATION;
                _closeDialog(reservation);
            }

            function cancel() {
                actionType = null;
                _closeDialog(null);
            }

            // -----------------------------------------------------------

            function _closeDialog(returnValue) {
                ctrl.deregisterBeginDateWatch();
                ctrl.deregisterEndDateWatch();
                $mdDialog.hide({actionType, reservation: returnValue});
            }

            function _onChangedBeginDate() {
                _checkDateOrderValidity();
                _checkOverlapValidity();
            }

            function _onChangedEndDate() {
                _checkDateOrderValidity();
                _checkOverlapValidity();
            }

            function _onChangedRoom() {
                _checkOverlapValidity();
            }

            function _checkDateOrderValidity() {
                if (_.isNil(ctrl.documentForm)) return;

                const isValid = _.lte(ctrl.reservation.beginDate, ctrl.reservation.endDate);
                ctrl.documentForm.$setValidity(FORM_VALIDITY_DATE_ORDER, isValid);
                ctrl.documentForm.startDate.$setValidity(FORM_VALIDITY_DATE_ORDER, isValid);
                ctrl.documentForm.endDate.$setValidity(FORM_VALIDITY_DATE_ORDER, isValid);
                if (!isValid) {
                    ctrl.errorMessageCode = 'whiteboardSurgery.INPUT_ERROR_MSG_DATE_ORDER';
                }
                else {
                    ctrl.errorMessageCode = null;
                }
            }

            function _checkOverlapValidity() {
                if (_.isNil(ctrl.documentForm)) return;

                const selectedRoom = ctrl.reservation.room;
                const selectedStartDate = ctrl.reservation.beginDate;
                const selectedEndDate = ctrl.reservation.endDate;
                if (selectedRoom && selectedStartDate && selectedEndDate) {
                    const isValid = !whiteboardSurgeryService.hasOverlapWithOtherRoomReservation(ctrl.reservation);
                    ctrl.documentForm.$setValidity(FORM_VALIDITY_DATE_OVERLAP, isValid);
                    ctrl.documentForm.startDate.$setValidity(FORM_VALIDITY_DATE_OVERLAP, isValid);
                    ctrl.documentForm.endDate.$setValidity(FORM_VALIDITY_DATE_OVERLAP, isValid);
                    if (!isValid) {
                        ctrl.errorMessageCode = 'whiteboardSurgery.INPUT_ERROR_MSG_RESERVATION_OVERLAP';
                    }
                    else {
                        ctrl.errorMessageCode = null;
                    }
                }
            }

            function _initializeReservation(companyId, isNew) {
                // new reservation
                if (isNew) {
                    ctrl.reservation = {
                        companyId: companyId,
                        description: '',
                        beginDate,
                        endDate,
                        room: ctrl.selectedRoom ? ctrl.selectedRoom : null
                    };
                } else {
                    // edit copy
                    ctrl.reservation = {
                        id: ctrl.roomReservation.id,
                        companyId: companyId,
                        description: ctrl.roomReservation.description,
                        beginDate: new Date(ctrl.roomReservation.beginDate),
                        endDate: new Date(ctrl.roomReservation.endDate),
                        room: ctrl.roomReservation.room
                    }
                }
            }
        }
    }
}

export default whiteboardSurgeryRoomReservationDialogService;