
// Resources
const RESOURCE_NAME = 'note';
const ENDPOINT_NAME = 'notes';
const ENDPOINT_NAME_HISTORY_NOTE = 'notes/history';
let Note;

const run = ['config', 'DS', function(config, DS) {
    Note = DS.defineResource({
        name: RESOURCE_NAME,
        endpoint: ENDPOINT_NAME,
        // basePath: config.apiServer,
        basePath: config.apiServerNotes,
        bypassCache: true,
        cacheResponse: false
    });
}];

dataServiceNotes.$inject = ['$q', 'config', 'DS', 'helpers', 'moment'];

function dataServiceNotes($q, config, DS, helpers, moment) {

    // modify/adjust 'Note' model
    Note.afterFind = function(Resource, data, cb) {
        return _deserialize(data);
    };
    Note.afterFindAll = function(Resource, data) {
        return _deserialize(data);
    };
    Note.beforeUpdate = function(Resource, data) {
        return _serialize(data);
    };
    Note.beforeCreate = function(Resource, data) {
        return _serialize(data);
    };

    var service = {
        createNote: createNote,
        createShiftNote: createShiftNote,
        getNote: getNote,
        getNotes: getNotes,
        getNotesCount: getNotesCount,
        getPatientNotes: getPatientNotes,
        getPatientNotesCount: getPatientNotesCount,
        getVisitNotes: getVisitNotes,
        getVisitNotesCount: getVisitNotesCount,
        saveNote: saveNote,
        setNoteRead: setNoteRead,
        setNoteReadAll: setNoteReadAll,
        deleteNote: deleteNote,
        getNotesToRestore: getNotesToRestore,
        getNotesToRestoreCount: getNotesToRestoreCount,
        restoreNote: restoreNote,
        getHistoryNote: getHistoryNote
    };

    return service;

    // --------------------------------------------------------------- Interface implementation

    function createNote(patientId, visitNb) {
        return Note.createInstance({
            patientId: patientId,
            visitNb: visitNb,
            referenceDate: moment().toDate()
        });
    }

    function createShiftNote(patientId, visitNb) {
        return Note.createInstance({
            patientId: patientId,
            visitNb: visitNb,
            referenceDate: moment().toDate(),
            shift: true
        });
    }

    function getNote(noteId) {
        return Note.find(noteId, {
            bypassCache: true,
            cacheResponse: true
        });
    }

    function getNotes(patientId, visitNb, categoryId, deleted, offset, limit, read, hasPictures, shift, creator, orderBy, sortOrder) {
        return Note
            .findAll({
                categoryid: categoryId,
                pid: patientId,
                visitNb: visitNb,
                deleted: deleted,
                limit: limit || 5,
                offset: offset || 0,
                read: read,
                haspictures: hasPictures,
                shift: shift,
                orderby: orderBy,
                sortorder: sortOrder,
                creator: creator
            });
    }

    function getNotesCount(patientId, visitNb, categoryId, deleted, read, hasPictures, shift, creator) {
        var endpoint = ENDPOINT_NAME + '/count';

        if (!patientId && !visitNb) {
            return $q.reject();
        }

        return Note
            .findAll({
                categoryid: categoryId,
                pid: patientId,
                deleted: deleted,
                read: read,
                haspictures: hasPictures,
                visitNb: visitNb,
                shift: shift,
                creator: creator
            }, {
                endpoint: endpoint,
                cacheResponse: false
            })
            .then(function(data) {
                return data.count;
            });
    }

    function getPatientNotes(patientId, categoryId, deleted, offset, limit, read, hasPictures, shift) {
        return getNotes(patientId, undefined, categoryId, deleted, offset, limit, read, hasPictures, shift);
    }

    function getPatientNotesCount(patientId, categoryId, deleted, read, hasPictures, shiftNotes) {
        return getNotesCount(patientId, undefined, categoryId, deleted, read, hasPictures, shiftNotes);
    }

    function getVisitNotes(visitNb, categoryId, deleted, offset, limit, read, hasPictures, shift) {
        return getNotes(undefined, visitNb, categoryId, deleted, offset, limit, read, hasPictures, shift);
    }

    function getVisitNotesCount(visitNb, categoryId, deleted, read, hasPictures, shiftNotes) {
        return getNotesCount(undefined, visitNb, categoryId, deleted, read, hasPictures, shiftNotes);
    }

    function saveNote(note) {
        if (_.isObject(note) && note.id >= 0) {
            return note.DSSave();
        } else {
            return Note
                .create(note)
                .then(function(data) {
                    // assign id and referenceDate of created (new) note
                    note.id = data.id;
                    note.referenceDate = data.referenceDate;
                });
        }
    }

    function setNoteRead(noteId, read) {
        var endpoint = config.apiServerNotes + '/' + ENDPOINT_NAME;
        if (read) {
            endpoint = endpoint + '/read';
        } else if (!read) {
            endpoint = endpoint + '/unread';
        }
        endpoint = endpoint + '?noteIds=' + noteId;
        return DS.adapters.http
            .PUT(endpoint);
    }

    function setNoteReadAll(patientId, visitNb, categoryId, read, shiftNotes, creator) {
        var endpoint = config.apiServerNotes + '/' + ENDPOINT_NAME;
        if (read) {
            endpoint = endpoint + '/read';
        } else if (!read) {
            endpoint = endpoint + '/unread';
        }

        if (shiftNotes && categoryId) {
            endpoint = endpoint + '?shift=' + shiftNotes + '&categoryid=' + categoryId;
        } else if (shiftNotes) {
            endpoint = endpoint + '?shift=' + shiftNotes;
        } else if (categoryId) {
            endpoint = endpoint + '?categoryid=' + categoryId;
        } else {
            endpoint = endpoint + '?';
        }

        if (patientId) {
            endpoint = endpoint + '&pid=' + patientId;
        } else if (visitNb) {
            endpoint = endpoint + '&visitNb=' + visitNb;
        }

        if (creator) {
            endpoint = endpoint + '&creator=' + creator;
        }

        return DS.adapters.http
            .PUT(endpoint);
    }

    function deleteNote(noteId) {
        return Note.destroy(noteId);
    }

    function getNotesToRestore(pid, vnb, offset, limit) {
        return getNotes(pid, vnb, null, true, offset, limit);
    }

    function getNotesToRestoreCount(pid, vnb, shiftNotes) {
        return getNotesCount(pid, vnb, null, true, null, null, shiftNotes);
    }

    function getHistoryNote(historyId) {
        return Note.find(historyId, {
            endpoint: ENDPOINT_NAME_HISTORY_NOTE
        });
    }

    function restoreNote(noteId) {
        var endpoint = ENDPOINT_NAME + '/' + noteId + '/restore';
        return Note.updateAll({}, {}, {
            endpoint: endpoint,
            cacheResponse: false,
            bypassCache: true
        });
    }

    // -------------------------------------------------------- Serialization / Deserialization

    function _serialize(data) {
        if (_.isObject(data)) {
            // Serialize properties before data item is returned
            helpers.removeProperty(data, 'patient');
            helpers.removeProperty(data, 'category');
            helpers.removeProperty(data, 'creator');
            helpers.removeProperty(data, 'editor');
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
            helpers.toDate(data, 'editedDate');
            helpers.toDate(data, 'referenceDate');
            helpers.addProperty(data, 'patientId', data.patient.pid);
            helpers.addProperty(data, 'categoryId', data.category.id);
        }
        return data;
    }

    // ------------------------------------------------------------------------ Helper methods

}

export {
    dataServiceNotes,
    run
};
