import _ from 'lodash';
import moment from 'moment';
import template from './whiteboardSurgeryReservationList.component.html';
import { is } from '@uirouter/core';

const WhiteboardSurgeryReservationList = {
    bindings: {
        reservations: '<?',
        selectedDate: '<?',
        companyId: '<?',
        roomName: '<?',
        onReservationsChanged: '&?'
    },
    controller: controller,
    templateUrl: template
};

controller.$injet = [
    '$translate',
    'logger',
    'whiteboardSurgeryRoomReservationDialogService',
    'whiteboardSurgeryService'
];

function controller(
    $translate,
    logger,
    whiteboardSurgeryRoomReservationDialogService,
    whiteboardSurgeryService
) {
    var ctrl = this;

    // Public methods
    ctrl.editReservation = editReservation;

    // Events
    ctrl.$onChanges = onChanges;

    // ------------------------------------------------ events

    /**
     * Style the reservations as soon as they change
     * @param {*} changes
     */
    function onChanges(changes) {
        if (changes && changes.reservations && changes.reservations.currentValue) {
            _.each(ctrl.reservations, reservation => {
                _calculatePositionAndDuration(reservation, reservation.beginDate, reservation.endDate, ctrl.selectedDate);
            });
        }
    }

    // ------------------------------------------------ public API

    function editReservation(reservation) {
        if (_.isNil(reservation) || _.isNil(reservation.id)) return;
        _editReservationAfterLock(reservation);
    }

    // ------------------------------------------------

    function _editReservationAfterLock(roomReservation) {
        whiteboardSurgeryRoomReservationDialogService.editRoomReservation({
            companyId: ctrl.companyId, 
            reservation: roomReservation, 
            roomName: ctrl.roomName
        })
        .then(({actionType, reservation, lockAcquired}) => {
            // reservation is locked by another user, cannot edit
            if (!actionType) {
                if (lockAcquired) {
                    // unlock resource
                    whiteboardSurgeryService.unlockRoomReservation(roomReservation.id);
                }
                return;
            }

            if (!_.isNil(reservation) && !_.isNil(reservation.room)) {
                // delete reservation
                if (actionType === whiteboardSurgeryRoomReservationDialogService.ACTION_DELETE_RESERVATION) {

                    whiteboardSurgeryService.deleteRoomReservation(roomReservation)
                    .then(success => {
                        // show success notification
                        logger.success($translate.instant('whiteboardSurgery.SUCCESS_ON_RESERVATION_ACTION', { ACTION: 'DELETE' }), false);
                    })
                    .catch(error => {
                        // show error notification
                        logger.error($translate.instant('whiteboardSurgery.ERROR_ON_RESERVATION_ACTION', { ACTION: 'DELETE' }), false);
                    })
                    .finally(() => {
                        // unlock resource
                        if (lockAcquired) {
                            whiteboardSurgeryService.unlockRoomReservation(roomReservation.id);
                        }

                        // callback for reservations changed
                        ctrl.onReservationsChanged();
                    })
                } else if (actionType === whiteboardSurgeryRoomReservationDialogService.ACTION_UPDATE_RESERVATION) {
                        // update reservation 
                        roomReservation.description = reservation.description;
                        roomReservation.room = reservation.room;
                        roomReservation.beginDate = reservation.beginDate;
                        roomReservation.endDate = reservation.endDate;

                        // update room reservation
                        whiteboardSurgeryService.updateRoomReservation(roomReservation)
                        .then(success => {
                            // show success notification
                            logger.success($translate.instant('whiteboardSurgery.SUCCESS_ON_RESERVATION_ACTION', { ACTION: 'SAVE' }), false);
                        })
                        .catch(error => {
                            // show error notification
                            logger.error($translate.instant('whiteboardSurgery.ERROR_ON_RESERVATION_ACTION', { ACTION: 'SAVE' }), false);
                        })
                        .finally(() => {
                            // unlock resource
                            if (lockAcquired) {
                                whiteboardSurgeryService.unlockRoomReservation(roomReservation.id);
                            }

                            // callback for reservations changed
                            ctrl.onReservationsChanged();
                        })
                }
            }
        });
    }

    /**
     * Calculate and apply the time (posiiton) and duration (height) of the given timeline item
     * @param {*} item
     * @param {Date} beginDate
     * @param {Date} endDate
     * @param {Date} selectedDate
     */
    function _calculatePositionAndDuration(item, beginDate, endDate, selectedDate) {
        const begin = moment(beginDate);
        const end = moment(endDate);
        const isStartingOnSelectedDay = moment(selectedDate).startOf('day').diff(moment(begin).startOf('day'), 'days') === 0;
        const isEndingOnSelectedDay = moment(selectedDate).startOf('day').diff(moment(end).startOf('day'), 'days') === 0;

        // if not start today, start from 0
        const startTime = isStartingOnSelectedDay ? ((begin.hours() * 60) + begin.minutes()) : 0;

        // if not end today then 24*60 - startMinutes as duration
        const duration = isEndingOnSelectedDay ? ((end.hours() * 60) + end.minutes()) - startTime : ((24 * 60) - startTime);

        // Set start point
        item.time = startTime + 1;

        // Set duration
        item.duration = duration - 1;
    }
}

export default WhiteboardSurgeryReservationList;
