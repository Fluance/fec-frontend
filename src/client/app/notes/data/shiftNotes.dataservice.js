// Resources
const RESOURCE_NAME = 'shiftNote';
const ENDPOINT_NAME = 'notes/shift';
let ShiftNote;

const run = ['config', 'DS', function(config, DS) {
    ShiftNote = DS.defineResource({
        name: RESOURCE_NAME,
        endpoint: ENDPOINT_NAME,
        // basePath: config.apiServer,
        basePath: config.apiServerNotes,
        bypassCache: true,
        cacheResponse: false
    });
}];

dataServiceShiftNotes.$inject = ['helpers'];

function dataServiceShiftNotes(helpers) {

    // modify/adjust 'ShiftNote' model
    ShiftNote.afterFindAll = function(Resource, data) {
        return _deserialize(data);
    };

    var service = {
        getShiftNotes: getShiftNotes,
        getShiftNotesCount: getShiftNotesCount
    };

    return service;

    // --------------------------------------------------------------- Interface implementation


    /**
     * Gets list of shift notes
     * Payload:
     * {
     *   notes: [
     *     {},
     *     {},
     *     ...
     *   ],
     *   shift: {
     *     startDate:
     *     endDate:
     *   }
     * }
     *
     * @param patientId
     * @param visitNb
     * @param categoryId
     * @param deleted
     * @param offset
     * @param limit
     * @param read
     * @param hasPictures
     * @param shiftNumber
     * @returns {*}
     */
    function getShiftNotes(patientId, visitNb, categoryId, deleted, offset, limit, read, hasPictures, creator, shiftNb, orderBy, sortOrder) {
        return ShiftNote
            .findAll({
                pid: patientId,
                visitNb: visitNb,
                categoryid: categoryId,
                deleted: deleted,
                limit: limit || 5,
                offset: offset || 0,
                read: read,
                haspictures: hasPictures,
                shift: true,
                shiftNb: shiftNb || 0,
                orderby: orderBy,
                sortorder: sortOrder,
                creator: creator
            }).then(function(data) {
                return data.notes;
            });
    }

    /**
     * Get count of shift notes
     * @param patientId
     * @param visitNb
     * @param categoryId
     * @param deleted
     * @param read
     * @param shiftNumber
     */
    function getShiftNotesCount(patientId, visitNb, categoryId, deleted, read, hasPictures, creator, shiftNb) {
        var endpoint = ENDPOINT_NAME + '/count';

        return ShiftNote
            .findAll({
                pid: patientId,
                visitNb: visitNb,
                categoryid: categoryId,
                deleted: deleted,
                read: read,
                haspictures: hasPictures,
                shift: true,
                shiftNb: shiftNb || 0,
                creator: creator
            }, {
                endpoint: endpoint,
                cacheResponse: false
            })
            .then(function(data) {
                return data.count;
            });
    }

    // -------------------------------------------------------- Serialization / Deserialization

    function _deserialize(data) {

        if (_.isObject(data) && !_.isNumber(data.count)) {
            if (_.isArray(data.notes)) {
                // Apply deserialization on all items in the array
                data.notes.map(function(note) {
                    _deserializeNote(note);
                })
            }
            if (_.isObject(data.shift)) {
                _deserializeShiftInfo(data.shift);
            }
        }
        return data;
    }

    function _deserializeNote(note) {
        if (_.isObject(note)) {
            // Deserialize properties before data item is returned
            helpers.toDate(note, 'editedDate');
            helpers.toDate(note, 'referenceDate');
            helpers.addProperty(note, 'patientId', note.patient.pid);
            helpers.addProperty(note, 'categoryId', note.category.id);
        }
        return note;
    }

    function _deserializeShiftInfo(shift) {
        if (_.isObject(shift)) {
            // Deserialize properties before data item is returned
            helpers.toDate(shift, 'startDate');
            helpers.toDate(shift, 'endDate');
        }
        return shift;
    }

}

export {
    dataServiceShiftNotes,
    run
}
