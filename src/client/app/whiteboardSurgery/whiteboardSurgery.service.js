/**
 * @ngdoc service
 * @module app.whiteboardSurgery
 * @name WhiteboardSurgeryService
 * @description
 *
 * The WhiteboardSurgery service is the interface all WhiteboardSurgery components talk to.
 */

const LOCK_RESOURCE_TYPE_OPERATION_NOTE = 'operation_note';
const LOCK_RESOURCE_TYPE_NOTE = 'surgeryboard';
const LOCK_RESOURCE_TYPE_ROOM_RESERVATION = 'surgeryboardbooking';

WhiteboardSurgeryService.$inject = ['$q', 'dataservice.appointments', 'dataservice.whiteboardSurgery', 'dataservice.locks', 'sessionService', 'dataservice.whiteboardSurgeryRoomReservation'];

/* @ngInject */
function WhiteboardSurgeryService($q, dataServiceAppointments, dataserviceWhiteboardSurgery, dataServiceLocks, session, dataserviceWhiteboardSurgeryRoomReservation) {

    // isolation types


    var _config;
    var _isActive = false;
    let roomsReservations; // "state" with list of all rooms reservations (for current view)

    var service = {
        // Methods
        init: init,
        isActive: isActive,
        getAppointmentStatusList: getAppointmentStatusList,
        getSurgeryboard: getSurgeryboard,
        setSurgeryboard: setSurgeryboard,
        getOperationNote: getOperationNote,
        setOperationNote: setOperationNote,
        getRoomReservations: getRoomReservations,
        getRoomReservation: getRoomReservation,
        createRoomReservation: createRoomReservation,
        updateRoomReservation: updateRoomReservation,
        deleteRoomReservation: deleteRoomReservation,
        hasOverlapWithOtherRoomReservation: hasOverlapWithOtherRoomReservation,

        lockOperationNoteItem: lockOperationNoteItem,
        unlockOperationNoteItem: unlockOperationNoteItem,
        lockSurgeryboard: lockSurgeryboard,
        unlockSurgeryboard: unlockSurgeryboard,
        lockRoomReservation: lockRoomReservation,
        unlockRoomReservation: unlockRoomReservation,

        // Events
        SURGERYBOARD_REFRESH_EVENT: 'fec-surgeryboardRefreshChanged',
        // EVENT_SURGERYBOARD_REFRESH_CHANGED: 'fec-surgeryboardRefreshChanged',
    };

    return service;

    // ------------------------------------------------------------------- Configuration methods

    /**
     * Initialize the service
     * @param {*} config
     */
    function init(config) {
        if (!_.isObject(config)) { return; }

        _config = config;
        service.isActive(true);

        roomsReservations = {};
    }

    /**
     * Check if it's active
     * @param {*} value
     */
    function isActive(value) {
        if (_.isUndefined(value)) {
            return _isActive;
        }
        else {
            var oldValue = _isActive;
            _isActive = value;
            return oldValue;
        }
    }

    // --------------------------------------------------------------- API methods

    /**
     * Get the Surgeryboard
     * @param {*} params
     */
    function getSurgeryboard(params) {
        return dataserviceWhiteboardSurgery.getSurgeryboard(params);
    }

    /**
     * Save the Surgeryboard
     * @param {*} params
     */
    function setSurgeryboard(params) {
        return dataserviceWhiteboardSurgery.setSurgeryboard(params);
    }

    function getOperationNote(appointmentId) {
        return dataServiceAppointments.getOperationNote(appointmentId);
    }

    function setOperationNote(appointmentId, note) {
        return dataServiceAppointments.setOperationNote(appointmentId, note);
    }

    function getAppointmentStatusList(companyId, rooms) {
        return dataServiceAppointments.getAppointmentStatusList(companyId, _.keys(rooms));
    }

    function getRoomReservations(params) {
        return dataserviceWhiteboardSurgeryRoomReservation.getRoomReservations(params)
        .then(reservations => {
            // refresh state: room reservations
            roomsReservations = reservations;
            return reservations;
        })
        .catch(error => {
            return error;
        });
    }

    function getRoomReservation(reservationId) {
        return dataserviceWhiteboardSurgeryRoomReservation.getRoomReservation(reservationId);
    }

    function updateRoomReservation(reservation) {
        return dataserviceWhiteboardSurgeryRoomReservation.updateRoomReservation(reservation);
    }

    function createRoomReservation(reservation) {
        return dataserviceWhiteboardSurgeryRoomReservation.createRoomReservation(reservation);
    }

    function deleteRoomReservation(reservation) {
        return dataserviceWhiteboardSurgeryRoomReservation.deleteRoomReservation(reservation.id);
    }

    function hasOverlapWithOtherRoomReservation(reservation) {
        let hasOverlap = false;

        _.forEach(roomsReservations, r => {
            if (r.room === reservation.room &&
                ((_.gte(reservation.beginDate, r.beginDate) && _.lte(reservation.beginDate, r.endDate)) ||
                (_.gte(reservation.endDate, r.beginDate) && _.lte(reservation.endDate, r.endDate)) ||
                (_.lte(reservation.beginDate, r.beginDate) && _.gte(reservation.endDate, r.endDate)))) {
                    // check for new reservation or different reservation
                    if (_.isNil(reservation.id) || (reservation.id && reservation.id !== r.id)) {
                        hasOverlap = true;
                    }
            }
        })
        return hasOverlap;
    }

    // --------------------------------------------------------------- Locking

    function lockOperationNoteItem(itemId) {
        return dataServiceLocks
            .lock(itemId, LOCK_RESOURCE_TYPE_OPERATION_NOTE)
            .catch(function (exception) {
                throw exception;
            });
    }

    function unlockOperationNoteItem(itemId) {
        return dataServiceLocks
            .unlock(itemId, LOCK_RESOURCE_TYPE_OPERATION_NOTE)
            .catch(function (reason) {
                throw reason;
            });
    }

    /**
     * Lock the Surgeryboard
     * @param {*} itemId
     */
    function lockSurgeryboard(itemId) {
        return dataServiceLocks
            .lock(itemId, LOCK_RESOURCE_TYPE_NOTE)
            .catch(function (exception) {
                throw exception;
            });
    }

    /**
     * Unlock the Surgeryboard
     * @param {*} itemId
     */
    function unlockSurgeryboard(itemId) {
        return dataServiceLocks
            .unlock(itemId, LOCK_RESOURCE_TYPE_NOTE)
            .catch(function (reason) {
                throw reason;
            });
    }

    /**
     * Lock a Room Reservation
     * @param {*} itemId
     */
    function lockRoomReservation(itemId) {
        return dataServiceLocks
            .lock(itemId, LOCK_RESOURCE_TYPE_ROOM_RESERVATION)
            .catch(function (exception) {
                throw exception;
            });
    }

    /**
     * Unlock a Room Reservation
     * @param {*} itemId
     */
    function unlockRoomReservation(itemId) {
        return dataServiceLocks
            .unlock(itemId, LOCK_RESOURCE_TYPE_ROOM_RESERVATION)
            .catch(function (reason) {
                throw reason;
            });
    }

}

export default WhiteboardSurgeryService;
