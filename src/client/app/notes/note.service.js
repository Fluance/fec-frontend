// jscs:disable requireParenthesesAroundIIFE
// Turn off jshint rules:
/*jshint -W101*/ //  Line too long
import _ from 'lodash';

const LOCK_RESOURCE_TYPE = 'note';

noteService.$inject = ['$q', '$filter', 'dataservice.locks', 'dataservice.notes', 'dataservice.shiftNotes', 'Event'];

function noteService($q, $filter, dataServiceLocks, dataServiceNotes, dataServiceShiftNotes, Event) {
    var _config,
        _isActive;

    var service = {
        init: init,
        isActive: isActive,

        // Public constants
        singleNoteChangedEvent: new Event(),
        multipleNotesChangedEvent: new Event(),

        // Notify event
        notifySingleNoteChanged: notifySingleNoteChanged,
        notifyMultipleNotesChanged: notifyMultipleNotesChanged,

        // API Functions
        // notes
        getNotes: getNotes,
        getNotesWithoutTemporaryFilter: getNotesWithoutTemporaryFilter,
        getNotesCount: getNotesCount,
        getNotesCountWithoutTemporaryFilter: getNotesCountWithoutTemporaryFilter,
        getPatientNotes: getPatientNotes,
        getVisitNotes: getVisitNotes,
        // read/unread
        setNoteRead: setNoteRead,
        setNoteReadAll: setNoteReadAll,
        // restore
        restoreNote: restoreNote,
        getNotesToRestore: getNotesToRestore,
        getNotesToRestoreCount: getNotesToRestoreCount,
        // locking
        lockNote: lockNote,
        unlockNote: unlockNote
    };

    return service;

    // -------------------------------------------------------- Interface methods

    // retrieve N&P button enabled/disabled status from config
    function init(config) {
        if (!_.isObject(config)) { return; }

        _config = config;
        service.isActive(true);
    }

    // Accessor Mutator
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

    // notes

    function getNotes(patientId, visitNb, categoryId, deleted, offset, limit, read, hasPictures, shift, creator, shiftNb , orderBy, sortOrder) {
        if (patientId) {
            return getPatientNotes(patientId, categoryId, deleted, offset, limit, read, hasPictures, shift, creator, shiftNb, orderBy, sortOrder);
        } else {
            return getVisitNotes(visitNb, categoryId, deleted, offset, limit, read, hasPictures, shift, creator, shiftNb, orderBy, sortOrder);
        }
    }

    function getNotesWithoutTemporaryFilter(patientId, visitNb, categoryId, deleted, offset, limit, read, hasPictures, creator, shiftNb, orderBy, sortOrder) {
        var deferred = $q.defer();
        var notes = [];
        if (patientId) {
            var notesWithShift = getPatientNotes(patientId, categoryId, deleted, offset, limit, read, hasPictures, true, creator, shiftNb,orderBy, sortOrder);
            var notesWithoutShift = getPatientNotes(patientId, categoryId, deleted, offset, limit, read, hasPictures, null, creator, shiftNb,orderBy, sortOrder);

            $q.all([notesWithShift, notesWithoutShift]).then(function (res) {
                notes = res[0].concat(res[1]);
                deferred.resolve(notes);
            });
        }
        else {
            var notesWithShift = getVisitNotes(visitNb, categoryId, deleted, offset, limit, read, hasPictures, true, creator, shiftNb);
            var notesWithoutShift = getVisitNotes(visitNb, categoryId, deleted, offset, limit, read, hasPictures, null, creator, shiftNb);

            $q.all([notesWithShift, notesWithoutShift]).then(function (res) {
                deferred.resolve(notes);
            });
        }
        return deferred.promise;
    }

    function getNotesCount(patientId, visitNb, categoryId, deleted, read, hasPictures, shift, creator, shiftNb) {
        if (shift) {
            return dataServiceShiftNotes.getShiftNotesCount(patientId, visitNb, categoryId, deleted, read, hasPictures, creator, shiftNb);
        } else {
            return dataServiceNotes.getNotesCount(patientId, visitNb, categoryId, deleted, read, hasPictures, shift, creator);
        }
    }

    function getNotesCountWithoutTemporaryFilter(patientId, visitNb, categoryId, deleted, read, hasPictures, creator, shiftNb) {
        var deferred = $q.defer();
        var amount = 0;
        var amountShift = dataServiceShiftNotes.getShiftNotesCount(patientId, visitNb, categoryId, deleted, read, hasPictures, creator, shiftNb);
        var amountNormal = dataServiceNotes.getNotesCount(patientId, visitNb, categoryId, deleted, read, hasPictures, false, creator);

        $q.all([amountShift, amountNormal]).then(function (res) {
            amount = res[0] + res[1];
            deferred.resolve(amount);
        });
        return deferred.promise;
    }

    function getPatientNotes(patientId, categoryId, deleted, offset, limit, read, hasPictures, shift, creator, shiftNb ,orderBy, sortOrder) {
        if (shift) {
            return dataServiceShiftNotes.getShiftNotes(patientId, undefined, categoryId, deleted, offset, limit, read, hasPictures, creator, shiftNb,orderBy, sortOrder);
        } else {
            return dataServiceNotes.getNotes(patientId, undefined, categoryId, deleted, offset, limit, read, hasPictures, shift, creator,orderBy, sortOrder);
        }
    }

    function getVisitNotes(visitNb, categoryId, deleted, offset, limit, read, hasPictures, shift, creator, shiftNb, orderBy, sortOrder) {
        if (shift) {
            return dataServiceShiftNotes.getShiftNotes(null, visitNb, categoryId, deleted, offset, limit, read, hasPictures, creator, shiftNb, orderBy, sortOrder);
        } else {
            return dataServiceNotes.getNotes(null, visitNb, categoryId, deleted, offset, limit, read, hasPictures, shift, creator, orderBy, sortOrder);
        }
    }
    // read/unread

    function setNoteRead(noteId, isRead) {
        return dataServiceNotes.setNoteRead(noteId, isRead).then(function (data) {
            notifySingleNoteChanged(data);
        });
    }

    function setNoteReadAll(patientId, visitNb, categoryId, readAll, shift, creator) {
        return dataServiceNotes.setNoteReadAll(patientId, visitNb, categoryId, readAll, shift, creator).then(function (data) {
            if (shift) {
                categoryId = undefined;
            }
            notifyMultipleNotesChanged({
                readState: readAll,
                categoryId: +categoryId,
                shift: shift,
                creator: creator
            });
        });
    }

    // restore

    function restoreNote(noteId) {
        return lockNote(noteId)
            .then(function () {
                return dataServiceNotes.restoreNote(noteId);
            })
            .then(function() {
                return unlockNote(noteId)
            })
            .catch(function (exception) {
                if (exception)
                    unlockNote(noteId);
            });
    }

    function getNotesToRestore(patientId, visitNb, limit, offset) {
        return dataServiceNotes.getNotesToRestore(patientId, visitNb, limit, offset)
    }

    function getNotesToRestoreCount(patientId, visitNb) {
        return dataServiceNotes.getNotesToRestoreCount(patientId, visitNb);
    }

    // locking

    function lockNote(noteId) {
        return dataServiceLocks
            .lock(noteId, LOCK_RESOURCE_TYPE)
            .catch(function (exception) {
                throw exception;
            });
    }

    function unlockNote(noteId) {
        return dataServiceLocks
            .unlock(noteId, LOCK_RESOURCE_TYPE)
            .catch(function (reason) {
                throw reason;
            });
    }

    // -------------------------------------------------------- Helper methods

    // Events

    function notifySingleNoteChanged(args) {
        service.singleNoteChangedEvent.raise(args);
    }

    function notifyMultipleNotesChanged(args) {
        service.multipleNotesChangedEvent.raise(args);
    }
}

export default noteService;
