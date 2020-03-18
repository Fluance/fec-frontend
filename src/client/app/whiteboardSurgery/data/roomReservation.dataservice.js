// Resources
const RESOURCE_NAME = 'roomReservation';
const ENDPOINT_NAME = 'surgeryboardbooking';
let RoomReservation;

const run = ['config', 'DS', function(config, DS) {
    RoomReservation = DS.defineResource({
        name: RESOURCE_NAME,
        endpoint: ENDPOINT_NAME,
        basePath: config.apiServer,
        bypassCache: true,
        cacheResponse: false
    });
}];

// RoomReservation model
// Date: ISO format <date>T<time><timezone>
// model = {
//     id: number,
//     companyId: number,
//     beginDate: Date,
//     endDate: Date,
//     room: string,
//     description: string
// }

RoomReservationDataService.$inject = ['$q', 'config', 'DS', 'helpers', 'moment'];

function RoomReservationDataService($q, config, DS, helpers, moment) {

    // modify/adjust 'Note' model
    RoomReservation.afterFind = function(Resource, data, cb) {
        return _deserialize(data);
    };
    RoomReservation.afterFindAll = function(Resource, data) {
        return _deserialize(data);
    };
    // RoomReservation.beforeUpdate = function(Resource, data) {
    //     return _serialize(data);
    // };
    // RoomReservation.beforeCreate = function(Resource, data) {
    //     return _serialize(data);
    // };

    const service = {
        getRoomReservations: getRoomReservations,
        getRoomReservation: getRoomReservation,
        createRoomReservation: createRoomReservation,
        updateRoomReservation: updateRoomReservation,
        deleteRoomReservation: deleteRoomReservation
    }

    return service;

    // --------------------------------------------------------------- Interface implementation

    function getRoomReservations(params) {
        return RoomReservation
            .findAll(params);
    }

    function getRoomReservation(reservationId) {
        return RoomReservation.find(reservationId, {
            bypassCache: true,
            cacheResponse: true
        });
    }

    function createRoomReservation(reservation) {
        return RoomReservation.create({
            companyId: reservation.companyId,
            beginDate: reservation.beginDate,
            endDate: reservation.endDate,
            room: reservation.room,
            description: reservation.description
        });
    }

    function updateRoomReservation(reservation) {
        return RoomReservation.update(reservation.id, {
            companyId: reservation.companyId,
            beginDate: reservation.beginDate,
            endDate: reservation.endDate,
            room: reservation.room,
            description: reservation.description
        })
    }

    function deleteRoomReservation(reservationId) {
        return RoomReservation.destroy(reservationId);
    }

    // -------------------------------------------------------- Serialization / Deserialization

    function _serialize(data) {
        if (_.isObject(data)) {
            // Serialize properties before data item is returned
        }
        return data;
    }

    function _deserialize(data) {
        if (_.isArray(data)) {
            // Apply deserialization on all items in the array
            data.map(function(item) {
                return _deserialize(item);
            });
        } else if (_.isObject(data) && !_.isNumber(data.count)) {
            // Deserialize properties before data item is returned
            helpers.toDate(data, 'beginDate');
            helpers.toDate(data, 'endDate');
        }
        return data;
    }
}

export {
    RoomReservationDataService,
    run
}